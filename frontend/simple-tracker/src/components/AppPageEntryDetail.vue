<template>
  <AppPage :title="toDurationString(duration)">
    <div>
      <h3 class="text-text/70">Name</h3>
      <h2>{{ entry.tasks?.name }}</h2>
    </div>
    <div>
      <table class="table-auto">
        <tbody>
          <tr>
            <td>Start</td>
            <td>{{ start.toLocaleTimeString() }}</td>
            <td>{{ start.toLocaleDateString() }}</td>
          </tr>
          <tr>
            <td>Stop</td>
            <td>{{ end?.toLocaleTimeString() }}</td>
            <td>{{ end?.toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
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

const end = computed(() => {
  if (!props.entry.end_time) return null;
  return new Date(props.entry.end_time);
});
</script>
