import { defineStore } from "pinia";
import type { Task } from "../common/types";
import {
  createTask,
  updateTask,
  addTagToTask as backendAddTagToTask,
  removeTagFromTask as backendRemoveTagFromTask,
} from "../common/supabaseClient";
import { ref } from "vue";
import { useTagsStore } from "./tags";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const tagsStore = useTagsStore();

  /**
   * creates a new task on the backend and adds it to the store
   * @param name name of the task
   * @param altCode alternative code for the task
   * @returns created task
   */
  async function create(name: string, altCode?: string): Promise<Task> {
    if (!name) {
      throw new Error("Task name is required");
    }
    const task = await createTask(name, altCode);
    if (!task) {
      throw new Error("Failed to create task");
    }
    put(task);
    return task;
  }

  /**
   * updates an existing task on the backend and updates it in the store
   * @param task task to update
   * @returns updated task
   */
  async function update(task: Task): Promise<Boolean> {
    if (!task) {
      throw new Error("Task is required");
    }

    const oldTask = get(task.id);
    if (!oldTask) {
      throw new Error("Task not found");
    }

    const updatedTask = await updateTask(task);
    if (!updatedTask) {
      put(oldTask); // revert to old task if update fails
      throw new Error("Failed to update task");
    }
    put(task);
    return updatedTask;
  }

  /**
   * adds a task to the store, if it doesn't exist, or updates it if it does.
   * This method does not call the backend.
   * @param task task to add or update
   */
  function put(task: Task) {
    if (!task) {
      throw new Error("Task is required");
    }

    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...task };
    } else {
      tasks.value.push(task);
    }
  }

  /**
   * gets a task by id
   * @param id id of the task to get
   * @returns task with the given id or undefined if not found
   */
  function get(id: string) {
    return tasks.value.find((t) => t.id === id);
  }

  /**
   * adds a tag to a task.
   * @param taskId task id to which the tag should be added
   * @param tagId tag id to add to the task
   * @returns void
   * @throws Error if task or tag is not found, or if adding the tag fails
   */
  async function addTagToTask(taskId: string, tagId: string) {
    const task = get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const tag = tagsStore.getTagById(tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }

    if (!task.tags) {
      task.tags = [];
    }

    //no duplicates
    if (task.tags.findIndex((t) => t.id === tag.id) > -1) {
      return;
    }

    task.tags.push(tag);
    put(task);

    // Update the task in the backend
    if (!(await backendAddTagToTask(task.id, tag.id))) {
      //revert
      const index = task.tags.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        task.tags.splice(index, 1);
        put(task);
      }
      throw new Error("Failed to add tag to task");
    }
  }

  async function removeTagFromTask(taskId: string, tagId: string) {
    const task = get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.tags || task.tags.length === 0) {
      return;
    }

    const tagIndex = task.tags.findIndex((t) => t.id === tagId);
    if (tagIndex < 0) {
      return;
    }

    // Remove the tag from the task
    task.tags.splice(tagIndex, 1);
    put(task);

    // Update the task in the backend
    if (!(await backendRemoveTagFromTask(task.id, tagId))) {
      // Revert the change if the backend update fails
      const tag = tagsStore.getTagById(tagId);
      if (tag) {
        task.tags.push(tag);
        put(task);
      }
      throw new Error("Failed to remove tag from task");
    }
  }

  return {
    tasks,
    create,
    update,
    put,
    get,
    addTagToTask,
    removeTagFromTask,
  };
});
