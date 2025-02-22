<template>
  <div v-if="currentTaskStore.task" class="flex flex-row justify-between">
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
        class="size-full text-primary"
      />
      <Spinner v-else class="size-9" />
    </div>
  </div>
</template>

<script setup>
/**
 * this component is responsible for displaying an active task and for stopping its tracking
 */
import { ref } from "vue";
import { stopCurrentTracking } from "../common/supabaseClient.ts";
import { StopIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";
import RunningTime from "./RunningTime.vue";
import { useCurrentTaskStore } from "../stores/currentTask";

const loading = ref(false);
const currentTaskStore = useCurrentTaskStore();

const stopTracking = async () => {
  loading.value = true;
  if (!(await stopCurrentTracking())) {
    loading.value = false;
    return;
  }

  currentTaskStore.task = null;
  loading.value = false;
};
</script>
