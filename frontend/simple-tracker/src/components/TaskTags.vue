<template>
  <AppTextSelect
    :items="tagsStore.tags"
    itemKey="id"
    searchBy="name"
    placeholder="Add tags..."
    @submit="onSubmit"
  ></AppTextSelect>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppTextSelect from "./AppTextSelect.vue";
import { useTagsStore } from "../stores/tags";

const tagsStore = useTagsStore();

onMounted(() => {
  tagsStore.loadTags();
});

const onSubmit = async (payload: { value: string; matchCount: number }) => {
  const newTagName = payload.value.trim().toLowerCase();
  if (newTagName == "") return;

  //create new tag
  await tagsStore.addTag(payload.value);
};
</script>
