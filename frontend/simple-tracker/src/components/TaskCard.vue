<template>
  <!-- task card -->
  <div
    class="bg-background dark:bg-blend-overlay grainy rounded-md p-4 flex flex-col gap-2"
  >
    {{ task.name }}
  </div>
</template>

<script setup lang="ts">
import { type Task } from "../common/types";

defineProps<{
  task: Task;
}>();
</script>
