import { setActivePinia, createPinia } from "pinia";
import {
  createTask,
  updateTask,
  addTagToTask,
  removeTagFromTask,
} from "../../common/supabaseClient";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTasksStore } from "../tasks";
import { useTagsStore } from "../tags";
import type { Tag, Task } from "../../common/types";

vi.mock("../../common/supabaseClient", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  addTagToTask: vi.fn(),
  removeTagFromTask: vi.fn(),
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

  it("create should add a new task to the store", async () => {
    const mockTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    vi.mocked(createTask).mockResolvedValue(mockTask);

    const store = useTasksStore();
    const task = await store.create("Test Task", "TT");

    expect(store.tasks).toContainEqual(mockTask);
    expect(task).toEqual(mockTask);
  });

  it("create should throw an error if name is not provided", async () => {
    const store = useTasksStore();
    await expect(store.create("")).rejects.toThrow("Task name is required");
  });

  it("create should throw an error if task creation fails", async () => {
    vi.mocked(createTask).mockResolvedValue(null);

    const store = useTasksStore();
    await expect(store.create("Test Task")).rejects.toThrow(
      "Failed to create task"
    );
  });

  it("update should update an existing task in the store", async () => {
    const mockTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    vi.mocked(updateTask).mockResolvedValue(true);

    const store = useTasksStore();
    store.tasks = [mockTask];
    const updatedTask = { ...mockTask, name: "Updated Task" };
    await store.update(updatedTask);

    expect(store.tasks).toContainEqual(updatedTask);
  });

  it("update should throw an error if task is not provided", async () => {
    let task: Task = null as unknown as Task; // Type assertion to avoid TypeScript error
    const store = useTasksStore();
    await expect(store.update(task)).rejects.toThrow("Task is required");
  });

  it("update should throw an error if task update fails", async () => {
    const mockTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    vi.mocked(updateTask).mockResolvedValue(false);

    const store = useTasksStore();
    store.tasks = [mockTask];
    await expect(store.update(mockTask)).rejects.toThrow(
      "Failed to update task"
    );
  });

  it("put should add a new task to the store if it doesn't exist", () => {
    const store = useTasksStore();
    const newTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.put(newTask);
    expect(store.tasks).toContainEqual(newTask);
  });

  it("put should update an existing task in the store if it exists", () => {
    const store = useTasksStore();
    const existingTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.tasks = [existingTask];
    const updatedTask = { ...existingTask, name: "Updated Task" };
    store.put(updatedTask);
    expect(store.tasks).toContainEqual(updatedTask);
  });

  it("put should not add duplicate tasks", () => {
    const store = useTasksStore();
    const existingTask: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.tasks = [existingTask];
    const newTask = { ...existingTask, name: "Test Task" };
    store.put(newTask);
    expect(store.tasks).toHaveLength(1);
  });

  it("put should throw an error if task is not provided", () => {
    const store = useTasksStore();
    let task: Task = null as unknown as Task; // Type assertion to avoid TypeScript error
    expect(() => store.put(task)).toThrow("Task is required");
  });

  it("should add a tag to a task", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.put(task);

    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    vi.mocked(addTagToTask).mockResolvedValue(true);
    await store.addTagToTask(task.id, mockTag.id);
    expect(store.tasks[0].tags).toContainEqual(mockTag);
  });

  it("should not add a tag that does not exist", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.put(task);

    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    await expect(
      store.addTagToTask(task.id, "nonexistent-tag-id")
    ).rejects.toThrow("Tag not found");
  });

  it("should not add a tag to a task that does not exist", async () => {
    const store = useTasksStore();
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    await expect(
      store.addTagToTask("nonexistent-task-id", mockTag.id)
    ).rejects.toThrow("Task not found");
  });

  it("should not add a duplicate tag to a task that already has it", async () => {
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
      tags: [mockTag], // Start with the tag already added
    };
    store.put(task);

    // Add the tag first
    await store.addTagToTask(task.id, mockTag.id);

    const taskAfterAdding = store.get(task.id);
    expect(taskAfterAdding).toBeDefined();
    expect(taskAfterAdding!.tags).toHaveLength(1); // Should still have only one instance of the tag
  });

  it("should revert tag addition if backend fails", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
    };
    store.put(task);
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);
    vi.mocked(addTagToTask).mockResolvedValueOnce(false);
    await expect(store.addTagToTask(task.id, mockTag.id)).rejects.toThrow(
      "Failed to add tag to task"
    );
    expect(store.tasks[0].tags).toEqual([]); // Tag should not be added
  });
  it("should remove a tag from a task", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
      tags: [
        {
          id: "1",
          name: "Test Tag",
          created_at: new Date().toISOString(),
          user_id: "user1",
        },
      ],
    };
    store.put(task);
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);
    vi.mocked(removeTagFromTask).mockResolvedValue(true);
    await store.removeTagFromTask(task.id, mockTag.id);
    expect(store.tasks[0].tags).toEqual([]); // Tag should be removed
  });

  it("should not remove a tag that does not exist in the task", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
      tags: [],
    };
    store.put(task);
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    await store.removeTagFromTask(task.id, mockTag.id);

    expect(store.tasks[0].tags).toEqual([]); // No change expected
  });

  it("should not remove a tag from a task that does not exist", async () => {
    const store = useTasksStore();
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);

    await expect(
      store.removeTagFromTask("nonexistent-task-id", mockTag.id)
    ).rejects.toThrow("Task not found");
  });

  it("should revert tag removal if backend fails", async () => {
    const store = useTasksStore();
    const task: Task = {
      id: "1",
      name: "Test Task",
      alt_code: "TT",
      user_id: "",
      created_at: "",
      is_favorite: false,
      tags: [
        {
          id: "1",
          name: "Test Tag",
          created_at: new Date().toISOString(),
          user_id: "user1",
        },
      ],
    };
    store.put(task);
    const tagsStore = useTagsStore();
    const mockTag: Tag = {
      id: "1",
      name: "Test Tag",
      created_at: new Date().toISOString(),
      user_id: "user1",
    };
    tagsStore.tags.push(mockTag);
    vi.mocked(removeTagFromTask).mockResolvedValueOnce(false);
    await expect(store.removeTagFromTask(task.id, mockTag.id)).rejects.toThrow(
      "Failed to remove tag from task"
    );
    expect(store.tasks[0].tags).toContainEqual(mockTag); // Tag should still be present
  });
});
