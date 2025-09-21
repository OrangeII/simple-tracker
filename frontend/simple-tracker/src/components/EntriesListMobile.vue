<template>
  <div
    v-for="(dateEntries, date) in timeLineStore.timeEntriesByDate"
    :key="date"
  >
    <div class="pt-4 px-4 font-bold uppercase flex flex-row justify-between">
      <div>{{ toEntriesDateString(new Date(date)) }}</div>
      <div class="pr-2">
        {{ toDurationString(new Date(dateEntries.totalTime)) }}
      </div>
    </div>

    <div v-if="!grouped">
      <TransitionGroup name="list-slide-left">
        <EntriesListItem
          v-for="entry in dateEntries.entries"
          :key="entry.id"
          :entry="entry"
          class="px-4"
          @onResumeClicked="(event) => $emit('onResume', event)"
          @onDeleteClicked="(event) => $emit('onDeleteEntry', event)"
          @onClick="$emit('onEntryClick', entry)"
          @onFavoriteClicked="(event) => $emit('onFavoriteClicked', event)"
        >
        </EntriesListItem>
      </TransitionGroup>
    </div>
    <div v-else>
      <TransitionGroup name="list-slide-left">
        <EntriesListGroupedItem
          v-for="group in dateEntries.entriesById"
          :key="group.id"
          :group="group"
          class="px-4"
          @onResumeClicked="(event) => $emit('onResume', event)"
          @onDeleteClicked="(event) => $emit('onDeleteGroup', event)"
          @onClick="$emit('onGroupClick', group)"
          @onFavoriteClicked="(event) => $emit('onFavoriteClicked', event)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimelineStore } from "../stores/timeline";
import { toEntriesDateString, toDurationString } from "../common/timeUtils";
import type { TimeEntry, TaskGroup } from "../common/types";
import EntriesListItem from "./EntriesListItem.vue";
import EntriesListGroupedItem from "./EntriesListGroupedItem.vue";

const timeLineStore = useTimelineStore();

defineProps<{
  grouped: boolean;
}>();

defineEmits<{
  onResume: [TimeEntry];
  onDeleteEntry: [TimeEntry];
  onEntryClick: [TimeEntry];
  onFavoriteClicked: [TimeEntry];
  onDeleteGroup: [TaskGroup];
  onGroupClick: [TaskGroup];
}>();
</script>
