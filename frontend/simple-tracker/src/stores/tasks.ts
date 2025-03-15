import { defineStore } from "pinia";
import { getTasks } from "../common/supabaseClient";
import type { Task } from "../common/types";
import { ref } from "vue";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);

  async function loadTasks() {
    const data = await getTasks();
    if (data) {
      tasks.value = data;
    }
  }

  /**
   * adds a task to the store, and saves it to the backend. Does nothing if the task already exists.
   * @param task task to add
   */
  async function addTask(task: Task): Promise<boolean> {
    const existingTask = tasks.value.find((t) => t.id === task.id);
    if (existingTask) {
      return false;
    }

    tasks.value.push(task);
    return true;
  }

  return {
    tasks,
    loadTasks,
    addTask,
  };
});
