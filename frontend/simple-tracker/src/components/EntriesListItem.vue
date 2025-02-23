<template>
  <EntriesListItemLayout :loading="entry.loading" @onResume="onResume">
    <template #left>
      <h3 class="truncate">{{ entry.tasks?.name }}</h3>
    </template>

    <template v-if="entry.end_time" #duration>
      {{
        toDurationString(
          new Date(
            new Date(entry.end_time).getTime() -
              new Date(entry.start_time).getTime()
          )
        )
      }}
    </template>
  </EntriesListItemLayout>
</template>

<script setup lang="ts">
import { toDurationString } from "../common/timeUtils";
import type { TimeEntry } from "../common/types";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";

const emit = defineEmits<{
  onResumeClicked: [entry: TimeEntry];
}>();

const props = defineProps<{
  entry: TimeEntry;
}>();

const onResume = () => {
  emit("onResumeClicked", props.entry);
};
</script>
