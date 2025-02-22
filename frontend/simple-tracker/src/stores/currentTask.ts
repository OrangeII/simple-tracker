import { defineStore } from "pinia";
import type { CurrentTask } from "../common/types";
import { ref } from "vue";
import { getCurrentTaskAndTimeEntry } from "../common/supabaseClient";

export const useCurrentTaskStore = defineStore("currentTask", () => {
  const task = ref<CurrentTask | null>(null);

  async function fetchCurrentTask() {
    task.value = await getCurrentTaskAndTimeEntry();
  }

  return {
    task,
    fetchCurrentTask,
  };
});
