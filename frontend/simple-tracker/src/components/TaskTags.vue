<template>
  <AppTextSelect
    :items="tagsStore.tags"
    itemKey="id"
    searchBy="name"
    placeholder="Add tags..."
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
</script>
