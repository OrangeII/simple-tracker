<template>
  <EntriesListItemLayout
    :loading="group.entries[0].loading"
    @onResume="onResume"
  >
    <template #left>
      <div class="flex-grow flex flex-row items-center">
        <div
          v-if="group.entries.length > 1"
          class="min-w-8 min-h-8 border-2 border-primary rounded-md mr-3 ml-1 text-primary flex items-center justify-center"
        >
          <p>{{ group.entries.length }}</p>
        </div>
        <h3 class="truncate">{{ group.name }}</h3>
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

const emit = defineEmits<{
  onResumeClicked: [entry: TimeEntry];
}>();

const props = defineProps<{
  group: TaskGroup;
}>();

const onResume = () => {
  emit("onResumeClicked", props.group.entries[0]);
};
</script>
