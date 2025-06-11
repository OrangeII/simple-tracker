import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTimeEntriesStore } from "../timeEntries";
import type { TimeEntry } from "../../../common/types";
import { deleteEntry, updateEntry } from "../../../common/supabaseClient";

vi.mock("../../../common/supabaseClient", () => ({
  deleteEntry: vi.fn(),
  updateEntry: vi.fn(),
}));

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

  it("remove should delete the time entry from the store", async () => {
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
    vi.mocked(deleteEntry).mockResolvedValue(true);
    await store.remove(mockTimeEntry);
    expect(store.timeEntries).not.toContainEqual(mockTimeEntry);
    expect(deleteEntry).toHaveBeenCalledWith(mockTimeEntry.id);
  });

  it("remove should throw an error if time entry is not provided", async () => {
    const store = useTimeEntriesStore();
    await expect(store.remove(null as unknown as TimeEntry)).rejects.toThrow(
      "Time entry is required"
    );
  });

  it("remove should revert optimistic change if deletion fails", async () => {
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

    // Mock deleteEntry to fail
    vi.mocked(deleteEntry).mockResolvedValueOnce(false);

    await expect(store.remove(mockTimeEntry)).rejects.toThrow(
      "Failed to delete time entry"
    );

    // Check if the entry is still in the store
    expect(store.timeEntries).toContainEqual(mockTimeEntry);
  });

  it("removeAll should remove all provided entries", async () => {
    const store = useTimeEntriesStore();
    const mockTimeEntries: TimeEntry[] = [
      {
        id: "1",
        task_id: "1",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        user_id: "",
        created_at: "",
      },
      {
        id: "2",
        task_id: "2",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        user_id: "",
        created_at: "",
      },
    ];
    mockTimeEntries.forEach((entry) => store.put(entry));
    vi.mocked(deleteEntry).mockResolvedValue(true);

    await store.removeAll(mockTimeEntries);

    expect(store.timeEntries).toEqual([]);
    expect(deleteEntry).toHaveBeenCalledTimes(mockTimeEntries.length);
  });

  it("update should update the time entry in the store", async () => {
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
    vi.mocked(updateEntry).mockResolvedValue(true);
    await store.update(updatedTimeEntry);
    expect(store.timeEntries).toContainEqual(updatedTimeEntry);
    expect(updateEntry).toHaveBeenCalledWith(updatedTimeEntry);
  });

  it("update should throw an error if time entry is not provided", async () => {
    const store = useTimeEntriesStore();
    await expect(store.update(null as unknown as TimeEntry)).rejects.toThrow(
      "Time entry is required"
    );
  });

  it("update should revert optimistic change if update fails", async () => {
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

    // Mock updateEntry to fail
    vi.mocked(updateEntry).mockResolvedValueOnce(false);

    await expect(
      store.update({ ...mockTimeEntry, task_id: "2" })
    ).rejects.toThrow("Failed to update time entry");

    // Check if the original entry is still in the store
    expect(store.timeEntries).toContainEqual(mockTimeEntry);
  });
});
