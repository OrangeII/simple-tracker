import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useNavigationStore, NavigationPage } from "../navigation";

describe("Navigation Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with 'entries' as default page", () => {
    const store = useNavigationStore();
    expect(store.currentPage).toBe(NavigationPage.ENTRIES);
  });

  it("should change current page when navigating", () => {
    const store = useNavigationStore();
    // Get all enum values
    const pages = Object.values(NavigationPage);

    for (const page of pages) {
      store.navigateTo(page);
      expect(store.currentPage).toBe(page);
    }
  });

  it("should correctly check if a page is current", () => {
    const store = useNavigationStore();

    // Default is "entries"
    expect(store.isCurrentPage(NavigationPage.ENTRIES)).toBe(true);
    expect(store.isCurrentPage(NavigationPage.TAGS)).toBe(false);

    // Change page
    store.navigateTo(NavigationPage.TAGS);
    expect(store.isCurrentPage(NavigationPage.TAGS)).toBe(true);
    expect(store.isCurrentPage(NavigationPage.ENTRIES)).toBe(false);
  });
});
