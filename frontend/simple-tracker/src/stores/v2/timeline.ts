import { defineStore } from "pinia";
import { useTasksStore } from "./tasks";
import { useTimeEntriesStore } from "./timeEntries";
import { computed, ref } from "vue";
import type { DateGroup, TimeEntryRecord } from "../../common/types";
import { getEntries } from "../../common/supabaseClient";

export const useTimelineStore = defineStore("timeline", () => {
  const timeEntriesStore = useTimeEntriesStore();
  const tasksStore = useTasksStore();
  const timeEntries = computed(() => {
    return timeEntriesStore.timeEntries
      .filter((entry) => entry.start_time && entry.end_time)
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
  });

  const limit = ref<number>(30);
  const page = ref<number>(0);
  const loading = ref<boolean>(false);

  function reset() {
    limit.value = 30; //default limit
    page.value = 0; //default page
    loading.value = false;
  }

  /**
   * fetches the time entries from the backend and adds them to the timeEntries store
   * it will also fetch the tasks for each time entry and add them to the tasks store
   * @returns void
   */
  async function fetchEntries() {
    if (loading.value) return;
    loading.value = true;

    const newEntries = await getEntries(limit.value, page.value);
    if (!newEntries) {
      loading.value = false;
      return;
    }

    putEntries(newEntries);
    if (newEntries.length >= limit.value) {
      page.value++;
    }
    loading.value = false;
  }

  /**
   * puts entries to the timeEntries store.
   * Also puts time entries tasks to the tasks store.
   * @param newEntries an array of TimeEntry objects to add to the timeEntries store
   */
  function putEntries(newEntries: TimeEntryRecord[]) {
    for (const newEntry of newEntries) {
      timeEntriesStore.put(newEntry);
      if (newEntry.tasks) {
        tasksStore.put(newEntry.tasks);
      }
    }
  }

  const timeEntriesByDate = computed<Record<string, DateGroup>>(() => {
    const days: Record<string, DateGroup> = {};
    for (const entry of timeEntries.value) {
      let task = tasksStore.get(entry.task_id);

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
          name: task?.name || "Unknown",
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

  return {
    timeEntries,
    timeEntriesByDate,
    limit,
    page,
    loading,
    reset,
    fetchEntries,
  };
});
