import { defineStore } from "pinia";
import type { TimeEntry } from "../../common/types";
import { ref } from "vue";

export const useTimeEntriesStore = defineStore("timeEntries", () => {
  const timeEntries = ref<TimeEntry[]>([]);

  /**
   * adds a time entry to the store, if it doesn't exist, or updates it if it does.
   * This method does not call the backend.
   * @param timeEntry time entry to add or update
   */
  function put(timeEntry: TimeEntry) {
    if (!timeEntry) {
      throw new Error("Time entry is required");
    }

    const index = timeEntries.value.findIndex((t) => t.id === timeEntry.id);
    if (index !== -1) {
      timeEntries.value[index] = timeEntry;
    } else {
      timeEntries.value.push(timeEntry);
    }
  }

  /**
   * gets a time entry from the store by id
   * @param id id of the time entry to get
   * @returns the time entry with the given id, or undefined if it doesn't exist
   */
  function get(id: string) {
    const timeEntry = timeEntries.value.find((t) => t.id === id);
    return timeEntry;
  }

  return {
    timeEntries,
    put,
    get,
  };
});
