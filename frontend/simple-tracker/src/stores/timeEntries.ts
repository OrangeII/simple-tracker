import { defineStore } from "pinia";
import type { TimeEntry } from "../common/types";
import { ref } from "vue";
import { deleteEntry, updateEntry } from "../common/supabaseClient";

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

  /**
   * deletes a time entry from the store and the backend.
   * @param entry the time entry to remove
   * @throws Error if the entry is not provided or if the deletion fails
   */
  async function remove(entry: TimeEntry) {
    if (!entry) {
      throw new Error("Time entry is required");
    }

    // optimistically remove the entry from the store
    const index = timeEntries.value.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      timeEntries.value.splice(index, 1);
    }

    // delete entry from the backend
    if (!(await deleteEntry(entry.id))) {
      //revert the optimistic change if deletion fails
      timeEntries.value.push(entry);
      throw new Error("Failed to delete time entry");
    }
  }

  async function removeAll(entries: TimeEntry[]) {
    for (const entry of entries) {
      try {
        await remove(entry);
      } catch (error) {
        console.error(`Failed to remove entry ${entry.id}:`, error);
      }
    }
  }

  /**
   * updates a time entry in the store and the backend.
   * @param entry the time entry to update
   * @throws Error if the entry is not provided or if the update fails
   */
  async function update(entry: TimeEntry) {
    if (!entry) {
      throw new Error("Time entry is required");
    }

    const oldEntry = get(entry.id);
    if (!oldEntry) {
      throw new Error("Time entry not found");
    }

    // optimistically update the entry in the store
    put(entry);

    // update entry in the backend
    if (!(await updateEntry(entry))) {
      //revert the optimistic change if update fails
      put(oldEntry);
      throw new Error("Failed to update time entry");
    }
  }

  return {
    timeEntries,
    put,
    get,
    remove,
    removeAll,
    update,
  };
});
