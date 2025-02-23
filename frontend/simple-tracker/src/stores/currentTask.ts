import { defineStore } from "pinia";
import type { CurrentTask } from "../common/types";
import { ref } from "vue";
import {
  getCurrentTaskAndTimeEntry,
  subscribeToCurrentTasks,
  unsubscribeFromCurrentTasks,
} from "../common/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const useCurrentTaskStore = defineStore("currentTask", () => {
  const task = ref<CurrentTask | null>(null);
  const taskSubscription = ref<RealtimeChannel | null>(null);

  async function fetchCurrentTask() {
    task.value = await getCurrentTaskAndTimeEntry();
  }

  async function initializeSubscriptionToCurrentTask() {
    taskSubscription.value = await subscribeToCurrentTasks(async (payload) => {
      console.log("subscription payload", payload);
      await fetchCurrentTask();
    });
  }

  return {
    task,
    taskSubscription,
    fetchCurrentTask,
    initializeSubscriptionToCurrentTask,
  };
});
