<template>
  <div class="p-4">
    <!-- skeleton when loading -->
    <div v-if="isLoading">
      <div class="animate-pulse mb-2">
        <div
          class="h-10 w-full rounded-md bg-background grainy dark:bg-blend-overlay"
        ></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div
            class="h-24 rounded-md bg-background grainy dark:bg-blend-overlay"
          ></div>
        </div>
      </div>
    </div>

    <!-- actual content -->
    <div v-else>
      <input
        v-model="searchQuery"
        type="text"
        class="w-full rounded-md p-2 bg-background dark:bg-blend-overlay grainy font-medium text-lg focus:outline-none"
        placeholder="Search tags..."
      />

      <!-- Tags display section -->
      <div class="flex flex-wrap gap-2 mt-4">
        <TaskTag
          v-for="tag in filteredTags"
          :key="tag.id"
          :name="tag.name"
          :hex_color="tag.hex_color"
          class="w-fit"
          @click="selectTag(tag)"
        ></TaskTag>
      </div>
      <div
        v-if="filteredTags.length === 0"
        class="col-span-full text-center p-4 text-text/70"
      >
        No tags found matching your search.
      </div>
    </div>

    <!-- Tag detail panel -->
    <Transition :name="isDesktop ? 'list-slide-right' : 'page-slide'">
      <AppPageTag
        v-if="selectedTag"
        :tag="selectedTag"
        :key="selectedTag.id"
        :anchor="isDesktop ? 'right' : 'left'"
        :widthClass="isDesktop ? 'w-128' : ''"
        :class="[isDesktop ? 'border-l border-text/10' : '']"
        @close="selectedTag = null"
        @tag-updated="onTagUpdated"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useTagsStore } from "../stores/tags";
import { type Tag } from "../common/types";
import AppPageTag from "./AppPageTag.vue";
import { useBreakpoints } from "../common/breakpoints";
import TaskTag from "./TaskTag.vue";

onMounted(async () => {
  try {
    await tagsStore.loadTags();
  } finally {
    isLoading.value = false;
  }
});

const tagsStore = useTagsStore();
const isLoading = ref(true);
const searchQuery = ref("");
const selectedTag = ref<Tag | null>(null);
const { isDesktop } = useBreakpoints();

const filteredTags = computed(() => {
  if (!searchQuery.value) {
    return tagsStore.tags;
  }
  const query = searchQuery.value.toLowerCase();
  return tagsStore.tags.filter((tag: Tag) =>
    tag.name.toLowerCase().includes(query)
  );
});

const selectTag = (tag: Tag) => {
  selectedTag.value = tag;
};

const onTagUpdated = (_updatedTag: Tag) => {
  // Close the detail panel
  selectedTag.value = null;
};
</script>
