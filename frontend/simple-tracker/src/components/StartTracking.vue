<template>
  <div>
    <h2>Start tracking</h2>

    <input type="text" v-model="taskName" placeholder="Task name" />
    <input type="text" v-model="altCode" placeholder="alt code" />
    <button @click="start">
      {{ loading ? "Starting..." : "Start Tracking" }}
    </button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
/**this component is responsible for starting the tracking on a new task
 * stop current time entry
 * make new task
 * start time entry on new task
 */

import { ref } from "vue";
import { supabase } from "../main.ts";
import {
  stopCurrentTracking,
  createTask,
  startTracking,
} from "../common/supabaseClient.ts";

const taskName = ref("");
const altCode = ref("");
const loading = ref(false);
const message = ref("");

const emit = defineEmits(["taskCreated"]);

const start = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  loading.value = true;
  message.value = "";

  await stopCurrentTracking();

  const createdTask = await createTask(taskName.value, altCode.value);
  if (!createdTask) {
    loading.value = false;
    message.value = "Error creating the task";
    return;
  }
  const createdTimeEntry = await startTracking(createdTask.id);
  if (!createdTimeEntry) {
    loading.value = false;
    message.value = "Error creating the new time entry";
    return;
  }

  //emit the task created
  emit("taskCreated", { tasks: createdTask, time_entries: createdTimeEntry });
  message.value = "Task started succesfully!";
  taskName.value = "";
  altCode.value = "";
  loading.value = false;
};
</script>
