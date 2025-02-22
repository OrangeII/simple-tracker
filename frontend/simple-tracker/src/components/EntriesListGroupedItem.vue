<template>
  <div class="relative">
    <div
      :key="group.id"
      class="border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between items-center bg-bg"
    >
      <div class="flex-grow max-w-[75%] flex flex-row items-center">
        <div
          v-if="group.entries.length > 1"
          class="min-w-8 min-h-8 border-1 border-primary rounded-xs mr-3 ml-1 text-primary flex items-center justify-center"
        >
          <p>{{ group.entries.length }}</p>
        </div>
        <h3 class="truncate">{{ group.name }}</h3>
      </div>

      <div @click="onResume()" class="flex flex-col items-end">
        <div>
          {{ toDurationString(new Date(group.totalTime)) }}
        </div>
        <div color="flex flex-col items-center">
          <PlayIcon
            v-if="!group.entries[0].loading"
            class="size-8 text-primary"
          />
          <Spinner v-else class="size-8" />
        </div>
      </div>
    </div>

    <div
      v-if="group.entries.length > 1"
      class="w-full transform scale-98 -translate-y-18.5 border-wfdark border-1 rounded-sm absolute -z-10 bg-bg"
    >
      <div class="h-16"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toDurationString } from "../common/timeUtils";
import type { TaskGroup, TimeEntry } from "../common/types";
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

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
