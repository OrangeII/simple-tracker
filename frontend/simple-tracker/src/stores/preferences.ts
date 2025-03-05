import { defineStore } from "pinia";
import { ref } from "vue";

const KEY_DISPLAY_ENTRIES_GROUPED = "displayEntriesGroupedById";
const KEY_DISPLAY_ENTRIES_GROUPED_TOOLBAR = "displayEntriesGroupedByIdToolbar";
const KEY_DARK_MODE = "darkMode";
const KEY_DARK_MODE_TOOLBAR = "darkModeToolbar";

export const usePreferencesStore = defineStore("preferences", () => {
  const displayEntriesGroupedById = ref(false);
  const displayEntriesGroupedByIdToolbar = ref(false);
  const darkMode = ref(false);
  const darkModeToolbar = ref(false);
  loadFromLocalStorage();

  function toggleDisplayEntriesGroupedById() {
    displayEntriesGroupedById.value = !displayEntriesGroupedById.value;
    saveToLocalStorage();
  }
  function toggleDisplayEntriesGroupedByIdToolbar() {
    displayEntriesGroupedByIdToolbar.value =
      !displayEntriesGroupedByIdToolbar.value;
    saveToLocalStorage();
  }
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    saveToLocalStorage();
  }
  function toggleDarkModeToolbar() {
    darkModeToolbar.value = !darkModeToolbar.value;
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem(
      KEY_DISPLAY_ENTRIES_GROUPED,
      JSON.stringify(displayEntriesGroupedById.value)
    );
    localStorage.setItem(
      KEY_DISPLAY_ENTRIES_GROUPED_TOOLBAR,
      JSON.stringify(displayEntriesGroupedByIdToolbar.value)
    );
    localStorage.setItem(KEY_DARK_MODE, JSON.stringify(darkMode.value));
    localStorage.setItem(
      KEY_DARK_MODE_TOOLBAR,
      JSON.stringify(darkModeToolbar.value)
    );
  }

  function loadFromLocalStorage() {
    let data = localStorage.getItem(KEY_DISPLAY_ENTRIES_GROUPED);
    if (data !== null) {
      displayEntriesGroupedById.value = JSON.parse(data);
    }

    data = localStorage.getItem(KEY_DISPLAY_ENTRIES_GROUPED_TOOLBAR);
    if (data !== null) {
      displayEntriesGroupedByIdToolbar.value = JSON.parse(data);
    }

    data = localStorage.getItem(KEY_DARK_MODE);
    if (data !== null) {
      darkMode.value = JSON.parse(data);
    }
    data = localStorage.getItem(KEY_DARK_MODE_TOOLBAR);
    if (data !== null) {
      darkModeToolbar.value = JSON.parse(data);
    }
  }

  return {
    displayEntriesGroupedById,
    displayEntriesGroupedByIdToolbar,
    darkMode,
    darkModeToolbar,
    loadFromLocalStorage,
    saveToLocalStorage,
    toggleDisplayEntriesGroupedById,
    toggleDisplayEntriesGroupedByIdToolbar,
    toggleDarkMode,
    toggleDarkModeToolbar,
  };
});
