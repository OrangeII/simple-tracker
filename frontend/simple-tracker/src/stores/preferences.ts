import { defineStore } from "pinia";
import { ref } from "vue";

const STORAGE_KEY = "preferences-store";

interface PreferencesState {
  displayEntriesGroupedById: boolean;
}

export const usePreferencesStore = defineStore("preferences", () => {
  const preferences = ref({
    displayEntriesGroupedById: false,
  } as PreferencesState);
  loadFromLocalStorage();

  function toggleDisplayEntriesGroupedById() {
    preferences.value.displayEntriesGroupedById =
      !preferences.value.displayEntriesGroupedById;
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value));
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      preferences.value = JSON.parse(data);
    }
  }
  return {
    preferences,
    loadFromLocalStorage,
    saveToLocalStorage,
    toggleDisplayEntriesGroupedById,
  };
});
