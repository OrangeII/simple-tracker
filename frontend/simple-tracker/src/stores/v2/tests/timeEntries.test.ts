import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTimeEntriesStore } from "../timeEntries";
import type { TimeEntry } from "../../../common/types";

vi.mock("../../../common/supabaseClient", () => ({}));

describe("timeEntries store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize as empty array", () => {
    const store = useTimeEntriesStore();
    expect(store.timeEntries).toEqual([]);
  });

  it("put should add a new time entry to the store", () => {
    const store = useTimeEntriesStore();
    const mockTimeEntry: TimeEntry = {
      id: "1",
      task_id: "1",
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      user_id: "",
      created_at: "",
    };
    store.put(mockTimeEntry);
    expect(store.timeEntries).toContainEqual(mockTimeEntry);
  });

  it("put should update an existing time entry in the store", () => {
    const store = useTimeEntriesStore();
    const mockTimeEntry: TimeEntry = {
      id: "1",
      task_id: "1",
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      user_id: "",
      created_at: "",
    };
    store.put(mockTimeEntry);
    const updatedTimeEntry = { ...mockTimeEntry, task_id: "2" };
    store.put(updatedTimeEntry);
    expect(store.timeEntries).toContainEqual(updatedTimeEntry);
  });

  it("put should throw an error if time entry is not provided", () => {
    const store = useTimeEntriesStore();
    expect(() => store.put(null as unknown as TimeEntry)).toThrow(
      "Time entry is required"
    );
  });
});
