<template>
  <AppTextSelect
    class="mb-2"
    :items="tagsStore.tags"
    :exclude="taskTags"
    itemKey="id"
    searchBy="name"
    placeholder="Add tags..."
    @submit="onSubmit"
    @select="addTag"
    :showAddNew="true"
  ></AppTextSelect>
  <div class="flex flex-wrap gap-2 mb-2">
    <!-- Skeleton loader -->
    <template v-if="isLoading">
      <div
        v-for="n in 3"
        :key="n"
        class="py-1 px-2 rounded-md flex gap-2 items-center justify-between animate-pulse bg-background grainy dark:bg-blend-overlay"
      >
        <div class="size-6"></div>
        <div class="w-16 h-4"></div>
      </div>
    </template>

    <TaskTag
      v-for="tag in taskTags"
      :key="tag.id"
      :name="tag.name"
      :hex_color="tag.hex_color"
      :useConfirmClick="true"
      @click="removeTag(tag)"
    >
      <template #icon>
        <XCircleIcon
          class="size-6 text-accent"
          :style="tag.hex_color ? { color: tag.hex_color } : null"
        ></XCircleIcon>
      </template>
    </TaskTag>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppTextSelect from "./AppTextSelect.vue";
import { useTagsStore } from "../stores/tags";
import { useTasksStore } from "../stores/tasks";
import type { Tag } from "../common/types";
import { XCircleIcon } from "@heroicons/vue/24/solid";
import TaskTag from "./TaskTag.vue";
import { generateRandomColor } from "../common/colorUtils";

const tagsStore = useTagsStore();
const tasksStore = useTasksStore();
const isLoading = ref(true);

const props = defineProps<{
  taskId: string;
}>();

const task = computed(() => {
  return tasksStore.get(props.taskId);
});
const taskTags = computed(() => {
  if (!task.value) return [];
  if (!task.value.tags) return [];
  const tags: Tag[] = [];
  task.value.tags.forEach((tag) => {
    const foundTag = tagsStore.getTagById(tag.id);
    if (foundTag) {
      tags.push(foundTag);
    }
  });
  return tags;
});

onMounted(async () => {
  if (!task.value) {
    console.error("Task not found for ID:", props.taskId);
    return;
  }
  try {
    if (!tagsStore.tags.length) {
      isLoading.value = true;
      await tagsStore.loadTags();
    }
  } finally {
    isLoading.value = false;
  }
});

const onSubmit = async (payload: { value: string; matchCount: number }) => {
  const newTagName = payload.value.trim().toLowerCase();
  if (newTagName == "") return;

  //create new tag
  const added = await tagsStore.addTag(newTagName, generateRandomColor());
  if (!added) {
    return;
  }

  addTag(added);
};

const addTag = async (tag: Tag) => {
  if (!task.value) {
    console.error("Task not found for ID:", props.taskId);
    return;
  }

  tasksStore.addTagToTask(task.value.id, tag.id);
};

const removeTag = async (tag: Tag) => {
  if (!task.value) {
    console.error("Task not found for ID:", props.taskId);
    return;
  }

  tasksStore.removeTagFromTask(task.value.id, tag.id);
  return;
};
</script>
