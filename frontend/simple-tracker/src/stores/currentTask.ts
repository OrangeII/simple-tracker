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
  const taskSubscription = ref<RealtimeChannel>();

  async function fetchCurrentTask() {
    task.value = await getCurrentTaskAndTimeEntry();
  }

  async function initializeSubscriptionToCurrentTask() {
    if (taskSubscription.value) {
      return;
    }

    //i don't know why, if taskSubscription is declared <RealtimeChannel | null> then i cant use unsubscribeFromCurrentTasks
    const sub = await subscribeToCurrentTasks(async (_payload) => {
      await fetchCurrentTask();
    });
    if (sub) {
      taskSubscription.value = sub;
    }
  }

  async function cleanup() {
    if (taskSubscription.value) {
      await unsubscribeFromCurrentTasks(taskSubscription.value);
      taskSubscription.value = undefined;
    }
  }

  return {
    task,
    taskSubscription,
    fetchCurrentTask,
    initializeSubscriptionToCurrentTask,
    cleanup,
  };
});
