<template>
  <!-- working bar -->
  <div
    class="working-bar w-full h-[1px]"
    :class="[
      preferencesStore.preferences.darkMode
        ? 'gradient-dark'
        : 'gradient-light',
    ]"
  ></div>

  <!-- current task -->
  <div
    v-if="currentTaskStore.task"
    class="flex flex-row justify-between px-4 pt-4 pb-3"
  >
    <div class="flex-grow max-w-[60%]">
      <h2>
        <RunningTime
          :start="new Date(currentTaskStore.task.time_entries.start_time)"
        />
      </h2>
      <div class="truncate">{{ currentTaskStore.task.tasks.name }}</div>
    </div>
    <div class="size-12 flex items-center">
      <StopIcon
        v-if="!loading"
        @click="stopTracking"
        class="size-full text-primary cursor-pointer"
      />
      <Spinner v-else class="size-9" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * this component is responsible for displaying an active task and for stopping its tracking
 */
import { ref } from "vue";
import { stopCurrentTracking } from "../common/supabaseClient.ts";
import { StopIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";
import RunningTime from "./RunningTime.vue";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useEntriesListStore } from "../stores/entriesList";
import { usePreferencesStore } from "../stores/preferences.ts";

const loading = ref(false);
const currentTaskStore = useCurrentTaskStore();
const entriesListStore = useEntriesListStore();
const preferencesStore = usePreferencesStore();

const stopTracking = async () => {
  if (!currentTaskStore.task) return;

  loading.value = true;

  //optimistically push the current task to the entries list and reset the current task
  currentTaskStore.task.time_entries.end_time = new Date().toISOString();
  currentTaskStore.task.time_entries.tasks = currentTaskStore.task.tasks;
  entriesListStore.pushEntries([currentTaskStore.task.time_entries]);
  currentTaskStore.task = null;

  if (!(await stopCurrentTracking())) {
    loading.value = false;
    return;
  }

  loading.value = false;
};
</script>

<style scoped>
.gradient-light {
  background: linear-gradient(to right, #654ea3, #eaafc8);
}
.gradient-dark {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
}
.working-bar {
  animation: gradientAnimation 8s ease infinite;
  background-size: 200vw auto;
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
