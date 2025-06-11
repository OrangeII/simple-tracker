import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTimelineStore } from "../timeline";
import { useTimeEntriesStore } from "../timeEntries";
import { useTasksStore } from "../tasks";
import { useCurrentTaskStore } from "../currentTask";
import * as supabaseClient from "../../common/supabaseClient";
import type { CurrentTask, Task, TimeEntryRecord } from "../../common/types";

vi.mock("../../common/supabaseClient", () => ({
  getEntries: vi.fn(),
  stopCurrentTracking: vi.fn(),
}));

// Helper functions to create mock objects
const createMockTask = (id: string): Task => ({
  id,
  name: "Test Task",
  alt_code: "TT",
  user_id: "1",
  created_at: new Date().toISOString(),
  is_favorite: false,
});

const createMockTimeEntry = (id: string, taskId: string): TimeEntryRecord => ({
  id,
  task_id: taskId,
  start_time: new Date().toISOString(),
  end_time: new Date().toISOString(),
  user_id: "1",
  created_at: new Date().toISOString(),
});

const createMockTimeEntries = (count: number) => {
  const entries: TimeEntryRecord[] = [];
  for (let i = 0; i < count; i++) {
    const taskId = `task${i}`;
    const entryId = `entry${i}`;
    const task = createMockTask(taskId);
    const entry = createMockTimeEntry(entryId, taskId);
    entry.tasks = task;
    entries.push(entry);
  }
  return entries;
};

const createMockCurrentTask = (
  taskId: string,
  timeEntryId: string
): CurrentTask => {
  const task = createMockTask(taskId);
  const timeEntry = createMockTimeEntry(timeEntryId, taskId);
  timeEntry.end_time = undefined; // Simulate an ongoing task
  return {
    user_id: "1",
    task_id: taskId,
    time_entry_id: timeEntryId,
    tasks: task,
    time_entries: timeEntry,
  };
};

describe("useTimelineStore", () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());

    // Reset the mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize with default values", () => {
    const timelineStore = useTimelineStore();

    expect(timelineStore.limit).toBe(30);
    expect(timelineStore.page).toBe(0);
    expect(timelineStore.loading).toBe(false);
  });

  it("should reset store values", () => {
    const timelineStore = useTimelineStore();

    // Change values from default
    timelineStore.limit = 50;
    timelineStore.page = 2;
    timelineStore.loading = true;

    // Reset values
    timelineStore.reset();

    // Check if values are reset to default
    expect(timelineStore.limit).toBe(30);
    expect(timelineStore.page).toBe(0);
    expect(timelineStore.loading).toBe(false);
  });

  it("should not fetch entries when loading is true", async () => {
    const timelineStore = useTimelineStore();
    timelineStore.loading = true;

    await timelineStore.fetchEntries();

    expect(supabaseClient.getEntries).not.toHaveBeenCalled();
  });

  it("should fetch entries and put entries to entries store", async () => {
    const mockEntries: TimeEntryRecord[] = createMockTimeEntries(2);
    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockResolvedValue(mockEntries);

    const timelineStore = useTimelineStore();
    const timeEntriesStore = useTimeEntriesStore();
    const tasksStore = useTasksStore();

    await timelineStore.fetchEntries();

    expect(getEntriesMock).toHaveBeenCalledWith(30, 0);

    //check if entries are put in the store
    expect(timeEntriesStore.timeEntries).toEqual(mockEntries);
    //check if tasks are put in the store
    expect(tasksStore.tasks).toEqual(mockEntries.map((entry) => entry.tasks));
  });

  it("should not increment page when fewer entries than limit are returned", async () => {
    const mockEntries: TimeEntryRecord[] = createMockTimeEntries(1);

    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockResolvedValue(mockEntries);

    const timelineStore = useTimelineStore();

    await timelineStore.fetchEntries();

    expect(timelineStore.page).toBe(0); // Page should not increment
  });

  it("should increment page when limit entries are returned", async () => {
    const mockEntries: TimeEntryRecord[] = createMockTimeEntries(30);

    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockResolvedValue(mockEntries);

    const timelineStore = useTimelineStore();

    await timelineStore.fetchEntries();

    expect(timelineStore.page).toBe(1); // Page should increment
  });

  it("should handle errors during fetch", async () => {
    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockRejectedValue(new Error("Network error"));

    const timelineStore = useTimelineStore();

    await expect(timelineStore.fetchEntries()).rejects.toThrow("Network error");
    expect(timelineStore.loading).toBe(true); // Loading still true because of error
  });

  it("timeEntries computed should not include ongoing entry", async () => {
    const mockEntries: TimeEntryRecord[] = createMockTimeEntries(2);
    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockResolvedValue(mockEntries);

    const timelineStore = useTimelineStore();
    await timelineStore.fetchEntries();

    const currentTaskStore = useCurrentTaskStore();
    const timeEntriesStore = useTimeEntriesStore();

    // Mock the current task store to simulate stopping a task
    const mockCurrentTask = createMockCurrentTask("test_task", "test_entry");
    currentTaskStore.setCurrentTask(mockCurrentTask);
    expect(timeEntriesStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );

    expect(timelineStore.timeEntries).not.toContainEqual(
      mockCurrentTask.time_entries
    );
  });

  it("timeEntries computed should include stopped entry", async () => {
    const mockEntries: TimeEntryRecord[] = createMockTimeEntries(2);
    const getEntriesMock = vi.mocked(supabaseClient.getEntries);
    getEntriesMock.mockResolvedValue(mockEntries);

    const timelineStore = useTimelineStore();
    await timelineStore.fetchEntries();

    const currentTaskStore = useCurrentTaskStore();
    const timeEntriesStore = useTimeEntriesStore();

    // Mock the current task store to simulate stopping a task
    const mockCurrentTask = createMockCurrentTask("test_task", "test_entry");
    currentTaskStore.setCurrentTask(mockCurrentTask);
    expect(timeEntriesStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );
    expect(timelineStore.timeEntries).not.toContainEqual(
      mockCurrentTask.time_entries
    );

    vi.mocked(supabaseClient.stopCurrentTracking).mockResolvedValue(true);
    await currentTaskStore.stop();

    expect(timelineStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );
  });
});
