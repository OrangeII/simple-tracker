import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getEntries } from "../common/supabaseClient";
import type { TimeEntry, DateGroup, Task } from "../common/types";

export const useEntriesListStore = defineStore("entriesList", () => {
  const limit = ref<number>(30);
  const page = ref<number>(0);
  const loading = ref<boolean>(false);
  const entries = ref<TimeEntry[]>([]);

  function reset() {
    limit.value = 30; //default limit
    page.value = 0; //default page
    loading.value = false;
    entries.value = [];
  }

  async function fetchEntries() {
    if (loading.value) return;
    loading.value = true;

    const newEntries = await getEntries(limit.value, page.value);
    if (!newEntries) {
      loading.value = false;
      return;
    }

    pushEntries(newEntries);
    if (newEntries.length >= limit.value) {
      page.value++;
    }
    loading.value = false;
  }

  /**
   * adds entries to the entries list. Skips duplicates (by id). Skips entries that
   * @param newEntries an array of TimeEntry objects to add to the entries list
   */
  function pushEntries(newEntries: TimeEntry[]) {
    const filteredEntries = newEntries.filter(
      (newEntry) => !entries.value.some((entry) => entry.id === newEntry.id)
    );
    filteredEntries.forEach((entry) => {
      entry.loading = false;
    });

    entries.value.push(...filteredEntries);
    //sort entries by descending start time
    entries.value.sort((a, b) => {
      return (
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
    });
  }

  const entriesByDate = computed<Record<string, DateGroup>>(() => {
    const days: Record<string, DateGroup> = {};
    for (const entry of entries.value) {
      //group entries by start date

      //get entry start date
      const date = new Date(entry.start_time);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString();
      //make a new group if necessary
      if (!days[dateKey]) {
        days[dateKey] = {
          date,
          totalTime: 0,
          entries: [],
          entiresById: {},
        };
      }
      //push entry to date group
      days[dateKey].entries.push(entry);

      //also group entries by id within this date group
      if (!days[dateKey].entiresById[entry.task_id]) {
        days[dateKey].entiresById[entry.task_id] = {
          id: entry.task_id,
          date: new Date(dateKey).toISOString(),
          name: entry.tasks?.name || "Unknown",
          totalTime: 0,
          entries: [],
        };
      }
      //push entry in the id group
      days[dateKey].entiresById[entry.task_id].entries.push(entry);

      //add tracked time to totals
      if (entry.end_time) {
        const trackedTime =
          new Date(entry.end_time).getTime() -
          new Date(entry.start_time).getTime();
        days[dateKey].totalTime += trackedTime;
        days[dateKey].entiresById[entry.task_id].totalTime += trackedTime;
      }
    }
    return days;
  });

  function removeEntries(entriesToDelete: TimeEntry[]) {
    entriesToDelete.forEach((entry) => {
      const index = entries.value.findIndex((e) => e.id === entry.id);
      if (index !== -1) {
        entries.value.splice(index, 1);
      }
    });
  }

  /**
   * replaces existing entry in the entry list with another entry with the same id.
   * If such entry does not exist, the entry is simply pushed to the entries list.
   * If the entry has an attached task,
   * the task name and task altcode of the attached task will be updated for all entries whose
   * attached task id matches that of the new entry.
   *
   * @param entry entry to be updated
   */
  function updateEntry(entry: TimeEntry) {
    const index = entries.value.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      entries.value[index] = entry;
    } else {
      entries.value.push(entry);
    }

    if (entry.tasks) {
      updateTask(entry.tasks);
    }
  }

  /**
   * copies properties to all the tasks matching ids with the provided tasks
   * @param task to be updated
   */
  function updateTask(task: Task) {
    if (task == null) return;

    entries.value
      .filter((e) => e.task_id === task.id)
      .forEach((e) => {
        if (e.tasks && task) {
          //copy all matching properties from entry.tasks to e.tasks
          Object.keys(e.tasks).forEach((key) => {
            if (task === undefined) return;
            if (key in task) {
              (e.tasks as any)[key] = (task as any)[key];
            }
          });
        }
      });
  }

  return {
    limit,
    page,
    loading,
    entries,
    entriesByDate,
    fetchEntries,
    pushEntries,
    removeEntries,
    updateEntry,
    updateTask,
    reset,
  };
});
