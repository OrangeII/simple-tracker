<template>
  {{ formattedElapsed }}
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { toTimeString } from "../common/timeUtils";

const props = defineProps({
  start: Date,
});

const elapsed = ref(0);
let interval;

const updateElapsed = () => {
  elapsed.value = props.start - Date.now();
};

const formattedElapsed = computed(() => {
  return toTimeString(new Date(elapsed.value));
});

onMounted(() => {
  updateElapsed();
  interval = setInterval(updateElapsed, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>
