<template>
  <div>
    <input
      type="text"
      v-model="taskName"
      placeholder="Task name"
      class="w-full px-4 py-2 border-1 caret-primary focus:outline-primary mb-2"
    />

    <button @click="start" class="w-full">
      {{ loading ? "Starting..." : "Start Tracking" }}
    </button>
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
import { track } from "../common/supabaseClient.ts";

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

  const ret = await track({ name: taskName.value, altCode: altCode.value });
  if (!ref) {
    message.value = "Could not create new task to track";
    loading.value = false;
    return;
  }

  //emit the task created
  emit("taskCreated", ret);
  message.value = "Task started succesfully!";
  taskName.value = "";
  altCode.value = "";
  loading.value = false;
};
</script>
