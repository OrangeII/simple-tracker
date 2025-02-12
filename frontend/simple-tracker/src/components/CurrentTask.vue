<template>
  <div v-if="task" class="flex flex-row justify-between">
    <div class="flex-grow max-w-[60%]">
      <h2 class="truncate">{{ task.tasks.name }}</h2>
      <div>
        {{ new Date(task.time_entries.start_time).toLocaleString() }}
      </div>
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

const loading = ref(false);
const props = defineProps({
  task: Object,
});
const emit = defineEmits(["trackingStopped"]);

const stopTracking = async () => {
  loading.value = true;
  if (!(await stopCurrentTracking())) {
    loading.value = false;
    return;
  }

  emit("trackingStopped", props.task);
  loading.value = false;
};
</script>
