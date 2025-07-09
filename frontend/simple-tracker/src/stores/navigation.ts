import { defineStore } from "pinia";
import { ref } from "vue";

// Define all possible page names as an enum
export enum NavigationPages {
  ENTRIES = "entries",
  TAGS = "tags",
  DASHBOARD = "dashboard",
  REPORTS = "reports",
}

export const useNavigationStore = defineStore("navigation", () => {
  // Current page state
  const currentPage = ref<NavigationPages>(NavigationPages.ENTRIES);

  /**
   * Navigate to a specific page
   * @param page The page to navigate to
   */
  function navigateTo(page: NavigationPages) {
    if (page === currentPage.value) return;
    currentPage.value = page;
  }

  /**
   * Check if a given page is the current page
   * @param page The page to check
   * @returns boolean indicating if the provided page is currently active
   */
  function isCurrentPage(page: NavigationPages): boolean {
    return currentPage.value === page;
  }

  return {
    currentPage,
    navigateTo,
    isCurrentPage,
  };
});
