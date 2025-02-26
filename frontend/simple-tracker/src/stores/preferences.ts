import { defineStore } from "pinia";
import { ref } from "vue";

const KEY_DISPLAY_ENTRIES_GROUPED = "displayEntriesGroupedById";
const KEY_DARK_MODE = "darkMode";

export const usePreferencesStore = defineStore("preferences", () => {
  const displayEntriesGroupedById = ref(false);
  const darkMode = ref(false);
  loadFromLocalStorage();

  function toggleDisplayEntriesGroupedById() {
    displayEntriesGroupedById.value = !displayEntriesGroupedById.value;
    saveToLocalStorage();
  }
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem(
      KEY_DISPLAY_ENTRIES_GROUPED,
      JSON.stringify(displayEntriesGroupedById.value)
    );
    localStorage.setItem(KEY_DARK_MODE, JSON.stringify(darkMode.value));
  }

  function loadFromLocalStorage() {
    let data = localStorage.getItem(KEY_DISPLAY_ENTRIES_GROUPED);
    if (data !== null) {
      displayEntriesGroupedById.value = JSON.parse(data);
    }

    data = localStorage.getItem(KEY_DARK_MODE);
    if (data !== null) {
      darkMode.value = JSON.parse(data);
    }
  }
  return {
    displayEntriesGroupedById,
    darkMode,
    loadFromLocalStorage,
    saveToLocalStorage,
    toggleDisplayEntriesGroupedById,
    toggleDarkMode,
  };
});
