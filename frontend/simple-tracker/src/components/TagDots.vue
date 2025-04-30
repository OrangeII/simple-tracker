<template>
  <div class="flex flex-row">
    <div
      v-for="tag in task.tags"
      :key="tag.id"
      class="w-2 h-2 rounded-full mr-1"
      :style="{
        backgroundColor:
          tagsStore.getTagById(tag.id)?.hex_color ?? tag.hex_color,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../common/types";
import { useTagsStore } from "../stores/tags";

defineProps<{
  task: Task;
}>();

const tagsStore = useTagsStore();
</script>
