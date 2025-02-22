import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getEntries } from "../common/supabaseClient.ts";

export const useEntriesListStore = defineStore("entriesList", () => {
  const limit = ref(30);
  const page = ref(0);
  const loading = ref(false);
  const entries = ref([]);

  /**
   * result follows this format:
   * {
   *  date: {
   * 	  date,
   * 	  total time,
   * 	  entries: [entries],
   * 	  entriesById: {
   * 		  id: {
   * 			  id
   * 			  name
   * 			  totalTime
   *        entries: [entries]
   * 			}
   * 		}
   * 	}
   * }
   *
   */
  const entriesByDate = computed(() => {
    const days = {};
    for (const entry of entries.value) {
      //group entries by start date

      //get entry start date
      const date = new Date(entry.start_time);
      date.setHours(0, 0, 0, 0);

      //make a new group if necessary
      if (!days[date]) {
        days[date] = {
          date,
          totalTime: 0,
          entries: [],
          entiresById: {},
        };
      }
      //push entry to date group
      days[date].entries.push(entry);

      //also group entries by id within this date group
      if (!days[date].entiresById[entry.task_id]) {
        days[date].entiresById[entry.task_id] = {
          id: entry.task_id,
          name: entry.tasks.name,
          totalTime: 0,
          entries: [],
        };
      }
      //push entry in the id group
      days[date].entiresById[entry.task_id].entries.push(entry);

      //add tracked time to totals
      if (entry.end_time) {
        const trackedTime =
          new Date(entry.end_time) - new Date(entry.start_time);
        days[date].totalTime += trackedTime;
        days[date].entiresById[entry.task_id].totalTime += trackedTime;
      }
    }
    return days;
  });

  async function fetchEntries() {
    if (loading.value) return;
    loading.value = true;

    const newEntries = (await getEntries(limit.value, page.value)).filter(
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

  function pushEntries(newEntries) {
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
