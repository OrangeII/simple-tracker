import { defineStore } from "pinia";
import { ref } from "vue";

const KEY_DISPLAY_ENTRIES_GROUPED = "displayEntriesGroupedById";

export const usePreferencesStore = defineStore("preferences", () => {
  const displayEntriesGroupedById = ref(false);
  loadFromLocalStorage();

  function toggleDisplayEntriesGroupedById() {
    displayEntriesGroupedById.value = !displayEntriesGroupedById.value;
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem(
      KEY_DISPLAY_ENTRIES_GROUPED,
      JSON.stringify(displayEntriesGroupedById.value)
    );
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem(KEY_DISPLAY_ENTRIES_GROUPED);
    if (data !== null) {
      displayEntriesGroupedById.value = JSON.parse(data);
    }
  }
  return {
    displayEntriesGroupedById,
    loadFromLocalStorage,
    saveToLocalStorage,
    toggleDisplayEntriesGroupedById,
  };
});
