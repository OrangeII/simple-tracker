import { describe, it, expect, beforeEach, vi, should } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { PREFERENCES_CONFIG, usePreferencesStore } from "../stores/preferences";

describe("Preferences Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  it("should initialize with default values", () => {
    const store = usePreferencesStore();
    for (const p in PREFERENCES_CONFIG) {
      const config = PREFERENCES_CONFIG[p];
      expect(store.preferences[config.key]).toBe(config.defaultValue);
    }
  });

  it("should toggle preference values", () => {
    const store = usePreferencesStore();
    for (const p in PREFERENCES_CONFIG) {
      const config = PREFERENCES_CONFIG[p];
      //toggle and expect to have negation of default
      store.toggle(config.key);
      expect(store.preferences[config.key]).toBe(!config.defaultValue);

      //toggle and expect to have default again
      store.toggle(config.key);
      expect(store.preferences[config.key]).toBe(config.defaultValue);
    }
  });

  it("should save to local storage when preferences change", () => {
    const store = usePreferencesStore();
    for (const p in PREFERENCES_CONFIG) {
      const config = PREFERENCES_CONFIG[p];
      //toggle and expect to have saved negation of default
      store.toggle(config.key);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        config.key,
        JSON.stringify(!config.defaultValue)
      );
    }
  });

  it("should read values from local storage", () => {
    //prepare return values as negation of defaults
    const store = usePreferencesStore();
    for (const p in PREFERENCES_CONFIG) {
      const config = PREFERENCES_CONFIG[p];
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify(!config.defaultValue)
      );
      //load preferences and expect to negation of defaults
      store.loadFromLocalStorage();
      expect(store.preferences[config.key]).toBe(!config.defaultValue);
    }
  });
});
