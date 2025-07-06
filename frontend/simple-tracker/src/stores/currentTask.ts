import { defineStore } from "pinia";
import type { CurrentTask, Task } from "../common/types";
import { computed, ref } from "vue";
import {
  getCurrentTaskAndTimeEntry,
  subscribeToCurrentTasks,
  unsubscribeFromCurrentTasks,
  stopCurrentTracking,
  track as supabaseTrack,
} from "../common/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useTimeEntriesStore } from "./timeEntries";
import { useTasksStore } from "./tasks";

export const useCurrentTaskStore = defineStore("currentTask", () => {
  const taskSubscription = ref<RealtimeChannel>();

  const timeEntriesStore = useTimeEntriesStore();
  const tasksStore = useTasksStore();

  const taskId = ref<string | null>(null);
  const task = computed(() => {
    if (taskId.value == null) {
      return null;
    }
    return tasksStore.get(taskId.value);
  });

  const timeEntryId = ref<string | null>(null);
  const timeEntry = computed(() => {
    if (timeEntryId.value == null) {
      return null;
    }
    return timeEntriesStore.get(timeEntryId.value);
  });

  async function fetchCurrentTask() {
    const currentTask = await getCurrentTaskAndTimeEntry();
    setCurrentTask(currentTask);
  }

  function setCurrentTask(currentTask: CurrentTask | null) {
    if (!currentTask) {
      taskId.value = null;
      timeEntryId.value = null;
      return;
    }

    taskId.value = currentTask.task_id;
    if (currentTask.tasks && currentTask.tasks.id) {
      tasksStore.put(currentTask.tasks);
    }
    timeEntryId.value = currentTask.time_entry_id;
    if (currentTask.time_entries && currentTask.time_entries.id) {
      timeEntriesStore.put(currentTask.time_entries);
    }
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

  /**
   * wrapper for tracking a task using a QR code.
   * @param taskData qr code data in the form of:
   * ```json
   * {
   *  "taskId": "optional-uuid",
   *  "altCode": "optional-alternate-code"
   *  "name": "optional-task-name",
   * }
   */
  async function trackQR(taskData: {
    taskId?: string;
    altCode?: string;
    name?: string;
  }) {
    //at least one of taskId, altCode or name must be provided
    if (!taskData.taskId && !taskData.altCode && !taskData.name)
      throw new Error(
        "At least one of taskId, altCode or name must be provided"
      );

    //temporary task object to be used for tracking
    const task: Task = {
      id: taskData.taskId || "",
      user_id: "",
      name: taskData.name || "",
      alt_code: taskData.altCode || "",
      created_at: new Date().toISOString(),
      is_favorite: false,
    };
    return await track(task);
  }

  /**
   * Start tracking a task.
   * If a task is already being tracked, the current time entry will be stopped and put to the timeEntries list.
   * Then a new time entry will be started on the provided task and put to the timeEntries list.
   * @param taskToTrack task to start tracking
   * @returns true if the task was successfully tracked, false otherwise
   */
  async function track(taskToTrack: Task): Promise<boolean> {
    if (!taskToTrack) {
      throw new Error("Task to track is required");
    }

    //optimistically put the stopped time entry to the store
    if (timeEntry.value) {
      timeEntry.value.end_time = new Date().toISOString();
      timeEntriesStore.put(timeEntry.value);
    }

    //optimistically set the current task
    const startTime = new Date();
    setCurrentTask({
      user_id: taskToTrack.user_id,
      task_id: taskToTrack.id,
      time_entry_id: "",
      tasks: taskToTrack,
      time_entries: {
        id: "",
        task_id: taskToTrack.id,
        user_id: taskToTrack.user_id,
        start_time: startTime.toISOString(),
        created_at: new Date().toISOString(),
      },
    });

    const ret = await supabaseTrack({
      taskId: taskToTrack.id,
      altCode: taskToTrack.alt_code,
      name: taskToTrack.name,
      startTime,
    });
    //update store with the actual task
    setCurrentTask(ret);

    return !!ret;
  }

  /**
   * creates a new task and starts tracking it.
   * If a task is already being tracked, the current time entry will be stopped and put to the timeEntries list.
   * @param name task name
   * @param altCode task alt code
   * @returns the new task if it was created and tracked
   */
  async function trackNew(name: string, altCode?: string): Promise<Task> {
    if (!name) {
      throw new Error("Task name is required");
    }
    const taskToTrack = await tasksStore.create(name, altCode);
    if (!taskToTrack) {
      throw new Error("Failed to create task");
    }
    const res = await track(taskToTrack);
    if (!res) {
      throw new Error("Failed to track task");
    }
    return taskToTrack;
  }

  /**
   * stops tracking the current task and stops the current time entry.
   * If a task is not being tracked, an error will be thrown.
   * @returns true if the task was successfully stopped, false otherwise
   */
  async function stop(): Promise<Boolean> {
    if (!taskId.value) {
      throw new Error("Can't stop tracking: No task is being tracked");
    }

    //optimistically set the end time to the current time entry
    if (timeEntry.value) {
      timeEntry.value.end_time = new Date().toISOString();
      timeEntriesStore.put(timeEntry.value);
    }

    const res = await stopCurrentTracking();
    if (!res) {
      throw new Error("Failed to stop tracking task");
    }
    setCurrentTask(null);
    return res;
  }

  return {
    taskId,
    task,
    timeEntryId,
    timeEntry,
    taskSubscription,
    fetchCurrentTask,
    setCurrentTask,
    initializeSubscriptionToCurrentTask,
    cleanup,
    track,
    trackQR,
    trackNew,
    stop,
  };
});
