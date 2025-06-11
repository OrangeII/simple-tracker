import { setActivePinia, createPinia } from "pinia";
import {
  createTask,
  getCurrentTaskAndTimeEntry,
  subscribeToCurrentTasks,
  track,
  stopCurrentTracking,
} from "../../common/supabaseClient";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCurrentTaskStore } from "../currentTask";
import type { CurrentTask, Task, TimeEntry } from "../../common/types";
import { useTasksStore } from "../tasks";
import { useTimeEntriesStore } from "../timeEntries";
import type { RealtimeChannel } from "@supabase/supabase-js";

vi.mock("../../common/supabaseClient", () => ({
  getCurrentTaskAndTimeEntry: vi.fn(),
  updateTask: vi.fn(),
  subscribeToCurrentTasks: vi.fn(),
  unsubscribeFromCurrentTasks: vi.fn(),
  track: vi.fn(),
  createTask: vi.fn(),
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

const createMockTimeEntry = (id: string, taskId: string): TimeEntry => ({
  id,
  task_id: taskId,
  start_time: new Date().toISOString(),
  user_id: "1",
  created_at: new Date().toISOString(),
});

const createMockCurrentTask = (
  taskId: string,
  timeEntryId: string
): CurrentTask => {
  const task = createMockTask(taskId);
  const timeEntry = createMockTimeEntry(timeEntryId, taskId);

  return {
    user_id: "1",
    task_id: taskId,
    time_entry_id: timeEntryId,
    tasks: task,
    time_entries: timeEntry,
  };
};

describe("currentTask store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize with null task", () => {
    const store = useCurrentTaskStore();
    expect(store.task).toBeNull();
    expect(store.taskId).toBeNull();
    expect(store.timeEntryId).toBeNull();
    expect(store.timeEntry).toBeNull();
  });

  it("should fetch current task", async () => {
    const mockCurrentTask = createMockCurrentTask(
      "test_task_id",
      "test_time_entry_id"
    );
    vi.mocked(getCurrentTaskAndTimeEntry).mockResolvedValue(mockCurrentTask);

    const currentTaskStore = useCurrentTaskStore();
    const tasksStore = useTasksStore();
    const timeEntriesStore = useTimeEntriesStore();

    await currentTaskStore.fetchCurrentTask();

    // Check if the task and time entry are set correctly
    expect(tasksStore.tasks).toContainEqual(mockCurrentTask.tasks);
    expect(timeEntriesStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );
    expect(currentTaskStore.task).toEqual(mockCurrentTask.tasks);
    expect(currentTaskStore.timeEntry).toEqual(mockCurrentTask.time_entries);
  });

  it("should set current task correctly", () => {
    const store = useCurrentTaskStore();
    const mockCurrentTask = createMockCurrentTask(
      "test_task_id",
      "test_time_entry_id"
    );

    store.setCurrentTask(mockCurrentTask);

    expect(store.taskId).toBe(mockCurrentTask.task_id);
    expect(store.timeEntryId).toBe(mockCurrentTask.time_entry_id);

    const tasksStore = useTasksStore();
    const timeEntriesStore = useTimeEntriesStore();
    expect(tasksStore.tasks).toContainEqual(mockCurrentTask.tasks);
    expect(timeEntriesStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );
  });

  it("should throw an error if task to track is not provided", async () => {
    const currentTaskStore = useCurrentTaskStore();
    await expect(
      currentTaskStore.track(null as unknown as Task)
    ).rejects.toThrow("Task to track is required");
  });

  it("should track a task", async () => {
    const mockCurrentTask = createMockCurrentTask(
      "test_task_id",
      "test_time_entry_id"
    );

    vi.mocked(track).mockResolvedValue(mockCurrentTask);

    const currentTaskStore = useCurrentTaskStore();
    const tasksStore = useTasksStore();
    const timeEntriesStore = useTimeEntriesStore();

    const res = await currentTaskStore.track(mockCurrentTask.tasks);
    expect(res).toBe(true);

    expect(tasksStore.tasks).toContainEqual(mockCurrentTask.tasks);
    expect(timeEntriesStore.timeEntries).toContainEqual(
      mockCurrentTask.time_entries
    );
    expect(currentTaskStore.task).toEqual(mockCurrentTask.tasks);
    expect(currentTaskStore.timeEntry).toEqual(mockCurrentTask.time_entries);
  });

  it("should stop the current task if there is one", async () => {
    const mockCurrentTask1 = createMockCurrentTask(
      "test_task_id",
      "test_time_entry_id"
    );
    // Set current task to the store
    const currentTaskStore = useCurrentTaskStore();
    currentTaskStore.setCurrentTask(mockCurrentTask1);

    // Set up second task
    const mockCurrentTask2 = createMockCurrentTask(
      "test_task_id_2",
      "test_time_entry_id_2"
    );

    // Track a new task
    vi.mocked(track).mockResolvedValue(mockCurrentTask2);
    await currentTaskStore.track(mockCurrentTask2.tasks);

    // Check if current task is set correctly
    expect(currentTaskStore.taskId).toBe(mockCurrentTask2.task_id);
    expect(currentTaskStore.timeEntryId).toBe(mockCurrentTask2.time_entry_id);
    expect(currentTaskStore.task).toEqual(mockCurrentTask2.tasks);
    expect(currentTaskStore.timeEntry).toEqual(mockCurrentTask2.time_entries);

    // Check an end_time was set to the previous time entry
    expect(mockCurrentTask1.time_entries.end_time).toBeDefined();

    // Check if there are malformed time entries in the store
    const timeEntriesStore = useTimeEntriesStore();
    expect(timeEntriesStore.timeEntries).toEqual([
      mockCurrentTask1.time_entries,
      mockCurrentTask2.time_entries,
    ]);
  });

  it("should creata new task and track it", async () => {
    // mock values
    const mockTask = createMockTask("test_task_id");
    mockTask.name = "New Task";
    mockTask.alt_code = "alt_code";
    const mockCurrentTask = createMockCurrentTask(
      mockTask.id,
      "test_time_entry_id"
    );
    mockCurrentTask.tasks = mockTask;

    vi.mocked(createTask).mockResolvedValue(mockTask);
    vi.mocked(track).mockResolvedValue(mockCurrentTask);

    const tasksStore = useTasksStore();
    const currentTaskStore = useCurrentTaskStore();
    await currentTaskStore.trackNew(mockTask.name, mockTask.alt_code);
    expect(tasksStore.tasks).toContainEqual(mockTask);
    expect(currentTaskStore.task).toEqual(mockTask);
  });

  it("should initialize subscription to current task", async () => {
    const mockSubscription: RealtimeChannel = {
      on: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    } as unknown as RealtimeChannel;
    vi.mocked(subscribeToCurrentTasks).mockResolvedValue(mockSubscription);

    const currentTaskStore = useCurrentTaskStore();
    await currentTaskStore.initializeSubscriptionToCurrentTask();

    expect(currentTaskStore.taskSubscription).toEqual(mockSubscription);
  });

  it("should clean up subscription to current task", async () => {
    const mockSubscription: RealtimeChannel = {
      on: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    } as unknown as RealtimeChannel;
    const currentTaskStore = useCurrentTaskStore();
    currentTaskStore.taskSubscription = mockSubscription;

    await currentTaskStore.cleanup();
    expect(currentTaskStore.taskSubscription).toBeUndefined();
  });

  it("should stop tracking current task", async () => {
    const mockCurrentTask = createMockCurrentTask(
      "test_task_id",
      "test_time_entry_id"
    );
    mockCurrentTask.time_entries.end_time = undefined;

    const currentTaskStore = useCurrentTaskStore();
    currentTaskStore.setCurrentTask(mockCurrentTask);
    vi.mocked(stopCurrentTracking).mockResolvedValue(true);

    const res = await currentTaskStore.stop();
    expect(res).toBe(true);
    expect(currentTaskStore.task).toBeNull();
    expect(currentTaskStore.timeEntry).toBeNull();
    expect(currentTaskStore.taskId).toBeNull();
    expect(currentTaskStore.timeEntryId).toBeNull();
    expect(mockCurrentTask.time_entries.end_time).toBeDefined();
  });
});
