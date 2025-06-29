<template>
  <div class="flex flex-row gap-1">
    <TagDot
      v-for="tag in task.tags"
      :key="tag.id"
      :tag="tagsStore.getTagById(tag.id) ?? tag"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../common/types";
import { useTagsStore } from "../stores/tags";
import TagDot from "./TagDot.vue";

defineProps<{
  task: Task;
}>();

const tagsStore = useTagsStore();
</script>
