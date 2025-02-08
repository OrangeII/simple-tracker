<template>
  <div v-if="task">
    <h2>Current Task</h2>
    <div>{{ task.tasks.name }}</div>
    <div>
      start:
      {{ new Date(task.time_entries.start_time).toLocaleTimeString() }}
    </div>
    <button @click="stopTracking">Stop</button>
  </div>
</template>

<script setup>
/**
 * this component is responsible for displaying an active task and for stopping its tracking
 */
import { stopCurrentTracking } from "../common/supabaseClient.ts";

const props = defineProps({
  task: Object,
});
const emit = defineEmits(["trackingStopped"]);

const stopTracking = async () => {
  if (!(await stopCurrentTracking())) {
    return;
  }

  emit("trackingStopped", props.task);
};
</script>
