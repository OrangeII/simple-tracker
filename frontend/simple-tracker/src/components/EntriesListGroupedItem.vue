<template>
  <EntriesListItemLayout
    :loading="group.entries[0].loading"
    @onResume="onResume"
    @onDelete="onDelete"
    @onFavoriteClick="onFavoriteClicked"
    :isFavorite="group.entries[0].tasks?.is_favorite"
  >
    <template #left>
      <!-- main -->
      <div class="flex-grow flex flex-row items-center">
        <div
          v-if="group.entries.length > 1"
          class="min-w-8 min-h-8 border-2 border-primary rounded-md mr-3 ml-1 text-primary flex items-center justify-center"
        >
          <p>{{ group.entries.length }}</p>
        </div>
        <div class="flex-col max-w-full overflow-hidden">
          <h3 class="truncate max-w-full">{{ group.name }}</h3>
          <TagDots
            v-if="group.entries[0].tasks"
            :task="group.entries[0].tasks"
          />
        </div>
      </div>
    </template>

    <template #duration>
      {{ toDurationString(new Date(group.totalTime)) }}
    </template>
  </EntriesListItemLayout>
</template>

<script setup lang="ts">
import { toDurationString } from "../common/timeUtils";
import type { TaskGroup, TimeEntry } from "../common/types";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import TagDots from "./TagDots.vue";

const emit = defineEmits<{
  onResumeClicked: [entry: TimeEntry];
  onDeleteClicked: [entry: TaskGroup];
  onFavoriteClicked: [entry: TimeEntry];
}>();

const props = defineProps<{
  group: TaskGroup;
}>();

const onResume = () => {
  emit("onResumeClicked", props.group.entries[0]);
};

const onDelete = () => {
  emit("onDeleteClicked", props.group);
};

const onFavoriteClicked = () => {
  emit("onFavoriteClicked", props.group.entries[0]);
};
</script>
