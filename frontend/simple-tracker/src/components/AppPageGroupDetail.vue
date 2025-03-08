<template>
  <AppPage
    :title="toDurationString(new Date(group.totalTime))"
    @close="emit('close')"
  ></AppPage>
</template>

<script setup lang="ts">
import AppPage from "./AppPage.vue";
import { toDurationString } from "../common/timeUtils";
import type { TaskGroup } from "../common/types";

const props = defineProps<{ group: TaskGroup }>();

const emit = defineEmits<{
  close: [];
}>();
</script>
