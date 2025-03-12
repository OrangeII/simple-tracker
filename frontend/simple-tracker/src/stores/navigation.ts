import { defineStore } from "pinia";
import { ref } from "vue";

// Define all possible page names as an enum
export enum NavigationPage {
  ENTRIES = "entries",
  TAGS = "tags",
}

export const useNavigationStore = defineStore("navigation", () => {
  // Current page state
  const currentPage = ref<NavigationPage>(NavigationPage.ENTRIES);

  /**
   * Navigate to a specific page
   * @param page The page to navigate to
   */
  function navigateTo(page: NavigationPage) {
    currentPage.value = page;
  }

  /**
   * Check if a given page is the current page
   * @param page The page to check
   * @returns boolean indicating if the provided page is currently active
   */
  function isCurrentPage(page: NavigationPage): boolean {
    return currentPage.value === page;
  }

  return {
    currentPage,
    navigateTo,
    isCurrentPage,
  };
});
