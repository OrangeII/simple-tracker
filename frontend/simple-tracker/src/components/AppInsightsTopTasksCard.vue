<template>
  <!-- skeleton loader -->
  <div v-if="loading" class="animate-pulse h-36 rounded-sm standout p-4 flex-1">
    <h3 class="text-text/70">{{ title || "" }}</h3>
  </div>

  <!-- actual content -->
  <div v-else class="rounded-sm standout p-4 flex-1">
    <h3 class="text-text/70">{{ title || "" }}</h3>
    <div class="flex gap-2 items-center">
      <ClockIcon class="size-4 text-text/70"></ClockIcon>
      <h3>{{ timeTotal }}</h3>
      <h4 class="text-text/70">Total time</h4>
    </div>
    <div class="flex flex-col">
      <div
        v-for="(item, index) in topTasks"
        :key="index"
        class="flex items-center gap-1 grow"
      >
        <span v-if="index === 0">🥇</span>
        <span v-else-if="index === 1">🥈</span>
        <span v-else-if="index === 2">🥉</span>
        <div
          class="flex gap-2 items-center max-w-full overflow-hidden grow justify-between"
        >
          <h3 class="max-w-full truncate">{{ item.name }}</h3>
          <h4 class="text-text/70">
            {{ toDurationString(new Date(item.duration)) }}
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toDurationString } from "../common/timeUtils";
import { ClockIcon } from "@heroicons/vue/24/solid";
import type { TaskTimeInfo } from "../common/types";

defineProps<{
  timeTotal: string;
  topTasks: Array<TaskTimeInfo>;
  title: string;
  loading: boolean;
}>();
</script>
