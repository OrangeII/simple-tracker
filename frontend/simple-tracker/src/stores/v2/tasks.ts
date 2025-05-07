import { defineStore } from "pinia";
import type { Task } from "../../common/types";
import { createTask, updateTask } from "../../common/supabaseClient";
import { ref } from "vue";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);

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
    tasks.value.push(task);
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
    const updatedTask = await updateTask(task);
    if (!updatedTask) {
      throw new Error("Failed to update task");
    }
    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = task;
    }
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
      tasks.value[index] = task;
    } else {
      tasks.value.push(task);
    }
  }

  return {
    tasks,
    create,
    update,
    put,
  };
});
