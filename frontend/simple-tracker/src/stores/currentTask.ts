import { defineStore } from "pinia";
import type { CurrentTask, Task } from "../common/types";
import { ref } from "vue";
import {
  getCurrentTaskAndTimeEntry,
  subscribeToCurrentTasks,
  unsubscribeFromCurrentTasks,
  track as supabaseTrack,
} from "../common/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEntriesListStore } from "./entriesList";

export const useCurrentTaskStore = defineStore("currentTask", () => {
  const task = ref<CurrentTask | null>(null);
  const taskSubscription = ref<RealtimeChannel>();
  const entriesListStore = useEntriesListStore();

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

  async function track(taskToTrack: Task) {
    const startTime = new Date();

    //push the current task to the entries list
    if (task.value) {
      task.value.time_entries.end_time = new Date().toISOString();
      task.value.time_entries.tasks = task.value.tasks;
      entriesListStore.pushEntries([task.value.time_entries]);
      task.value = null;
    }

    //optimistically change the store
    task.value = {
      user_id: taskToTrack.user_id,
      task_id: taskToTrack.id,
      time_entry_id: "",
      tasks: taskToTrack,
      time_entries: {
        id: "",
        task_id: taskToTrack.id,
        user_id: taskToTrack.user_id,
        start_time: startTime.toISOString(),
        created_at: startTime.toISOString(),
      },
    };

    const ret = await supabaseTrack({ taskId: taskToTrack.id, startTime });
    if (!ret) {
      //reverse the optimistic change
      task.value = null;
      return;
    }

    //update store with the actual task
    task.value = ret;
  }

  return {
    task,
    taskSubscription,
    fetchCurrentTask,
    initializeSubscriptionToCurrentTask,
    cleanup,
    track,
  };
});
