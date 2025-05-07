import { defineStore } from "pinia";
import type { TimeEntry } from "../../common/types";
import { ref } from "vue";

export const useTimeEntriesStore = defineStore("timeEntries", () => {
  const timeEntries = ref<TimeEntry[]>([]);

  return {
    timeEntries,
  };
});
