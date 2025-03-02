<template>
  <AppPage :title="toDurationString(duration)">
    <div class="pb-4">
      <h2>{{ entry.tasks?.name }}</h2>
    </div>
    <div class="pb-4 flex flex-col gap-2">
      <div>
        <div class="flex gap-1 items-center">
          <PlayCircleIcon class="text-text/70 size-5"></PlayCircleIcon>
          <h3 class="text-text/70">Start</h3>
        </div>

        <div class="flex justify-between items-center gap-4">
          <div
            class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
          >
            <h2>
              {{ start.toLocaleTimeString() }}
            </h2>
          </div>
          <div
            class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
          >
            <h2>
              {{ start.toLocaleDateString() }}
            </h2>
          </div>
        </div>
      </div>
      <div v-if="stop !== null">
        <div class="flex gap-1 items-center">
          <StopCircleIcon class="text-text/70 size-5"></StopCircleIcon>
          <h3 class="text-text/70">Stop</h3>
        </div>
        <div class="flex justify-between items-center gap-4">
          <div
            class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
          >
            <h2>
              {{ stop?.toLocaleTimeString() }}
            </h2>
          </div>
          <div
            class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
          >
            <h2>
              {{ stop?.toLocaleDateString() }}
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-text/70">Alt. code</h3>
      <h2>{{ entry.tasks?.alt_code }}</h2>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { type TimeEntry } from "../common/types";
import AppPage from "./AppPage.vue";
import { toDurationString } from "../common/timeUtils";
import { computed } from "vue";
import { PlayCircleIcon, StopCircleIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{ entry: TimeEntry }>();

const duration = computed(() => {
  if (!props.entry.end_time) return new Date(0);
  return new Date(
    new Date(props.entry.end_time).getTime() -
      new Date(props.entry.start_time).getTime()
  );
});

const start = computed(() => {
  return new Date(props.entry.start_time);
});

const stop = computed(() => {
  if (!props.entry.end_time) return null;
  return new Date(props.entry.end_time);
});
</script>
