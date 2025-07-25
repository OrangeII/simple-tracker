import { defineStore } from "pinia";

export const useFeatureFlagsStore = defineStore("featureFlags", () => {
  const showDailyPatterns =
    import.meta.env.VITE_FF_SHOW_DAILY_PATTERNS === "true";

  return {
    showDailyPatterns,
  };
});
