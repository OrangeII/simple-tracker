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

  return {
    tasks,
    loadTasks,
  };
});
