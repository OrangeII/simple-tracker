import { defineStore } from "pinia";
import { ref } from "vue";

interface PreferenceConfig {
  key: string;
  defaultValue: boolean;
}

export const PREFERENCES_CONFIG: Record<string, PreferenceConfig> = {
  displayEntriesGroupedById: {
    key: "displayEntriesGroupedById",
    defaultValue: false,
  },
  displayEntriesGroupedByIdToolbar: {
    key: "displayEntriesGroupedByIdToolbar",
    defaultValue: false,
  },
  darkMode: {
    key: "darkMode",
    defaultValue: false,
  },
  darkModeToolbar: {
    key: "darkModeToolbar",
    defaultValue: false,
  },
  diplayTaskStats: {
    key: "diplayTaskStats",
    defaultValue: false,
  },
};

export const usePreferencesStore = defineStore("preferences", () => {
  const preferences = ref(
    Object.fromEntries(
      Object.entries(PREFERENCES_CONFIG).map(([_name, config]) => [
        config.key,
        config.defaultValue,
      ])
    )
  );

  loadFromLocalStorage();

  function toggle(preferenceName: keyof typeof PREFERENCES_CONFIG) {
    if (preferenceName in preferences.value) {
      preferences.value[preferenceName] = !preferences.value[preferenceName];
      saveToLocalStorage();
    }
  }

  function saveToLocalStorage() {
    Object.entries(preferences.value).forEach(([name, value]) => {
      localStorage.setItem(PREFERENCES_CONFIG[name].key, JSON.stringify(value));
    });
  }

  function loadFromLocalStorage() {
    Object.keys(PREFERENCES_CONFIG).forEach((name) => {
      const data = localStorage.getItem(PREFERENCES_CONFIG[name].key);
      if (data !== null && data !== undefined) {
        preferences.value[name] = JSON.parse(data);
      }
    });
  }

  return {
    preferences,
    toggle,
    loadFromLocalStorage,
    saveToLocalStorage,
  };
});
