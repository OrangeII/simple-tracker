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
import { onMounted, ref } from "vue";
import AppTextSelect from "./AppTextSelect.vue";
import { useTagsStore } from "../stores/tags";
import type { Tag, Task } from "../common/types";
import {
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
} from "../common/supabaseClient";
import { XCircleIcon } from "@heroicons/vue/24/solid";
import TaskTag from "./TaskTag.vue";
import { generateRandomColor } from "../common/colorUtils";

const tagsStore = useTagsStore();
const taskTags = ref<Tag[]>([]);
const isLoading = ref(true);

const props = defineProps<{
  task: Task;
}>();

onMounted(async () => {
  try {
    await tagsStore.loadTags();
    const tags = await getTaskTags(props.task.id);
    if (tags !== null) {
      taskTags.value = tags;
    } else {
      taskTags.value = [];
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
  //no duplicates
  if (taskTags.value.findIndex((t) => t.id === tag.id) > -1) {
    return;
  }

  //add the tag to this task
  taskTags.value.push(tag);
  if (!(await addTagToTask(props.task.id, tag.id))) {
    //revert
    const index = taskTags.value.findIndex((t) => t.id === tag.id);
    if (index > -1) {
      taskTags.value.splice(index, 1);
    }
    return;
  }
};

const removeTag = async (tag: Tag) => {
  //do nothing if not present
  const index = taskTags.value.findIndex((t) => t.id === tag.id);
  if (index === -1) return;

  taskTags.value.splice(index, 1);
  if (!removeTagFromTask(props.task.id, tag.id)) {
    //revert
    taskTags.value.splice(index, 0, tag);
    return;
  }
};
</script>
