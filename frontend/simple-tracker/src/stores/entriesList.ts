import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getEntries } from "../common/supabaseClient";
import type { TimeEntry, DateGroup } from "../common/types";

export const useEntriesListStore = defineStore("entriesList", () => {
  const limit = ref<number>(30);
  const page = ref<number>(0);
  const loading = ref<boolean>(false);
  const entries = ref<TimeEntry[]>([]);

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

  return {
    limit,
    page,
    loading,
    entries,
    entriesByDate,
    fetchEntries,
    pushEntries,
    removeEntries,
  };
});
