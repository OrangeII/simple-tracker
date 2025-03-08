<template>
  <div class="flex flex-wrap gap-2 mb-2">
    <div
      v-for="tag in taskTags"
      :key="tag.id"
      class="py-1 px-2 rounded-md border-1 border-text/30 flex gap-2 items-center justify-between"
      :style="tag.hex_color ? { borderColor: tag.hex_color } : null"
      @click="removeTag(tag)"
    >
      <XCircleIcon
        class="size-6 text-accent"
        :style="tag.hex_color ? { color: tag.hex_color } : null"
      ></XCircleIcon>
      <div>
        {{ tag.name }}
      </div>
    </div>
  </div>
  <AppTextSelect
    :items="tagsStore.tags"
    :exclude="taskTags"
    itemKey="id"
    searchBy="name"
    placeholder="Add tags..."
    @submit="onSubmit"
    @select="addTag"
  ></AppTextSelect>
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

const tagsStore = useTagsStore();
const taskTags = ref<Tag[]>([]);

const props = defineProps<{
  task: Task;
}>();

onMounted(async () => {
  await tagsStore.loadTags();
  const tags = await getTaskTags(props.task.id);
  if (tags !== null) {
    taskTags.value = tags;
  } else {
    taskTags.value = [];
  }
});

const onSubmit = async (payload: { value: string; matchCount: number }) => {
  const newTagName = payload.value.trim().toLowerCase();
  if (newTagName == "") return;

  //create new tag
  const added = await tagsStore.addTag(newTagName);
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
