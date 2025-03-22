<template>
  <div>STATS HERE</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { TaskStats } from "../common/types";
import { getTaskStats } from "../common/supabaseClient";

const props = defineProps<{ taskId: string }>();

const stats = ref<TaskStats | null>(null);
const loading = ref(false);

onMounted(() => {
  fetchStats();
});

const fetchStats = async () => {
  loading.value = true;
  const response = await getTaskStats(props.taskId);
  console.log(response);

  if (response) {
    stats.value = response;
  }
  loading.value = false;
};
</script>
