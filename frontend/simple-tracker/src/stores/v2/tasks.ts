import { defineStore } from "pinia";
import type { Task } from "../../common/types";
import { createTask, updateTask } from "../../common/supabaseClient";
import { ref } from "vue";

export const useTasksStore = defineStore("tasksV2", () => {
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
      tasks.value[index] = task;
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

  return {
    tasks,
    create,
    update,
    put,
    get,
  };
});
