<template>
  <div v-if="task">
    <h2>{{ task.tasks.name }}</h2>
    <div>
      {{ new Date(task.time_entries.start_time).toLocaleString() }}
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
