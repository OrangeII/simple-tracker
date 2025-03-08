<template>
  <div class="flex flex-wrap gap-2 mb-2">
    <div
      v-for="tag in taskTags"
      :key="tag.id"
      class="py-1 px-2 rounded-md border-1 border-text/30"
    >
      {{ tag.name }}
    </div>
  </div>
  <AppTextSelect
    :items="tagsStore.tags"
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
import { addTagToTask, getTaskTags } from "../common/supabaseClient";

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
</script>
