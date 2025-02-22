<template>
  {{ formattedElapsed }}
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { toDurationString } from "../common/timeUtils";

const props = defineProps({
  start: Date,
});

const elapsed = ref(0);
let interval: NodeJS.Timeout;

const updateElapsed = () => {
  if (!props.start) {
    elapsed.value = 0;
    return;
  }

  elapsed.value = props.start.getTime() - Date.now();
};

const formattedElapsed = computed(() => {
  return toDurationString(new Date(elapsed.value));
});

onMounted(() => {
  updateElapsed();
  interval = setInterval(updateElapsed, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>
