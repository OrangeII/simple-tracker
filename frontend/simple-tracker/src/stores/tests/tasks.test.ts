import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTasksStore } from "../tasks";
import { getTasks, createTask } from "../../common/supabaseClient";
import type { Task } from "../../common/types";

vi.mock("../../common/supabaseClient", () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
}));

describe("tasks store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize as empty array", () => {
    const store = useTasksStore();
    expect(store.tasks).toEqual([]);
  });

  it("should load tasks from backend", async () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        name: "Task 1",
        created_at: "2021-01-01",
        user_id: "1",
        is_favorite: false,
      },
      {
        id: "2",
        name: "Task 2",
        created_at: "2021-01-02",
        user_id: "1",
        is_favorite: false,
      },
    ];

    vi.mocked(getTasks).mockResolvedValueOnce(mockTasks);
    const store = useTasksStore();
    await store.loadTasks();
    expect(store.tasks).toEqual(mockTasks);
  });

  it("should add a task", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      created_at: "2021-01-01",
      user_id: "1",
      is_favorite: false,
    };

    vi.mocked(getTasks).mockResolvedValueOnce([]);
    vi.mocked(createTask).mockResolvedValueOnce(mockTask);

    const store = useTasksStore();
    await store.addTask(mockTask);
    expect(store.tasks).toEqual([mockTask]);
  });

  it("should not add a task if it already exists", async () => {
    const mockTask = {
      id: "1",
      name: "Task 1",
      created_at: "2021-01-01",
      user_id: "1",
      is_favorite: false,
    };

    vi.mocked(getTasks).mockResolvedValueOnce([mockTask]);
    vi.mocked(createTask).mockResolvedValueOnce(mockTask);

    const store = useTasksStore();
    await store.addTask(mockTask);
    expect(store.tasks).toEqual([mockTask]);
  });
});
