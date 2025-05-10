import { defineStore } from "pinia";
import { useTasksStore } from "./tasks";
import { useTimeEntriesStore } from "./timeEntries";
import { computed, ref } from "vue";
import type { TimeEntry } from "../../common/types";
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
  function putEntries(newEntries: TimeEntry[]) {
    for (const newEntry of newEntries) {
      timeEntriesStore.put(newEntry);
      if (newEntry.tasks) {
        tasksStore.put(newEntry.tasks);
      }
    }
  }

  return {
    timeEntries,
    limit,
    page,
    loading,
    reset,
    fetchEntries,
  };
});
