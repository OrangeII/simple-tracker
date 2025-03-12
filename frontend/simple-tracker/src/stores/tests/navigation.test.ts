import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useNavigationStore, NavigationPages } from "../navigation";

describe("Navigation Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with 'entries' as default page", () => {
    const store = useNavigationStore();
    expect(store.currentPage).toBe(NavigationPages.ENTRIES);
  });

  it("should change current page when navigating", () => {
    const store = useNavigationStore();
    // Get all enum values
    const pages = Object.values(NavigationPages);

    for (const page of pages) {
      store.navigateTo(page);
      expect(store.currentPage).toBe(page);
    }
  });

  it("should correctly check if a page is current", () => {
    const store = useNavigationStore();

    // Default is "entries"
    expect(store.isCurrentPage(NavigationPages.ENTRIES)).toBe(true);
    expect(store.isCurrentPage(NavigationPages.TAGS)).toBe(false);

    // Change page
    store.navigateTo(NavigationPages.TAGS);
    expect(store.isCurrentPage(NavigationPages.TAGS)).toBe(true);
    expect(store.isCurrentPage(NavigationPages.ENTRIES)).toBe(false);
  });
});
