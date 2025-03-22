<template>
  <div v-if="stats">
    <!-- total time -->
    <div class="flex gap-2 items-center">
      <ClockIcon class="size-4 text-text/70"></ClockIcon>
      <h3>{{ stats.total_time.split(".")[0] }}</h3>
      <h4 class="text-text/70">Total time</h4>
    </div>

    <!-- total entries -->
    <div class="flex gap-2 items-center">
      <Bars3Icon class="size-4 text-text/70"></Bars3Icon>
      <h3>{{ stats.entries_count }}</h3>
      <h4 class="text-text/70">Entries</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { TaskStats } from "../common/types";
import { getTaskStats } from "../common/supabaseClient";
import { ClockIcon, Bars3Icon } from "@heroicons/vue/24/solid";

const props = defineProps<{ taskId: string }>();

const stats = ref<TaskStats | null>(null);
const loading = ref(false);

onMounted(() => {
  fetchStats();
});

const fetchStats = async () => {
  loading.value = true;
  const response = await getTaskStats(props.taskId);
  if (response) {
    stats.value = response;
  }
  loading.value = false;
};
</script>
