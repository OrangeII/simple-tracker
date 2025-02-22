import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getEntries } from "../common/supabaseClient";
import type { TimeEntry, DateGroup } from "../common/types";

export const useEntriesListStore = defineStore("entriesList", () => {
  const limit = ref<number>(30);
  const page = ref<number>(0);
  const loading = ref<boolean>(false);
  const entries = ref<TimeEntry[]>([]);

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

  async function fetchEntries() {
    if (loading.value) return;
    loading.value = true;

    const newEntries = (await getEntries(limit.value, page.value))?.filter(
      (e) => e.end_time
    );
    if (!newEntries || newEntries.length == 0) {
      loading.value = false;
      return;
    }

    pushEntries(newEntries);
    page.value++;
    loading.value = false;
  }

  function pushEntries(newEntries: TimeEntry[]) {
    newEntries.forEach((entry) => {
      entry.loading = false;
    });

    entries.value.push(...newEntries);
  }

  return {
    limit,
    page,
    loading,
    entries,
    fetchEntries,
    entriesByDate,
  };
});
