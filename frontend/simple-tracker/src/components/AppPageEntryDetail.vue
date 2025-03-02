<template>
  <AppPage :title="toDurationString(duration)" @close="emit('close')">
    <template #actions>
      <div class="flex gap-1 items-center" @click="onSaveClick">
        <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
        <h3 class="uppercase text-primary">save</h3>
      </div>
    </template>
    <template #main>
      <div class="pb-4">
        <input
          type="text"
          v-model="taskName"
          class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
        />
      </div>
      <div class="pb-4 flex flex-col gap-2">
        <div>
          <div class="flex gap-1 items-center pb-1">
            <PlayCircleIcon class="text-text/70 size-5"></PlayCircleIcon>
            <h3 class="text-text/70">Start</h3>
          </div>
          <div class="flex justify-between items-center gap-4">
            <div
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
            >
              <h3>
                {{ start.toLocaleDateString() }}
              </h3>
            </div>
            <div
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
            >
              <h3>
                {{ start.toLocaleTimeString() }}
              </h3>
            </div>
          </div>
        </div>
        <div v-if="stop !== null">
          <div class="flex gap-1 items-center pb-1">
            <StopCircleIcon class="text-text/70 size-5"></StopCircleIcon>
            <h3 class="text-text/70">Stop</h3>
          </div>
          <div class="flex justify-between items-center gap-4">
            <div
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
            >
              <h3>
                {{ stop?.toLocaleDateString() }}
              </h3>
            </div>
            <div
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow"
            >
              <h3>
                {{ stop?.toLocaleTimeString() }}
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-text/70">Alt. code</h3>
        <h3>{{ entry.tasks?.alt_code }}</h3>
      </div>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { type TimeEntry } from "../common/types";
import AppPage from "./AppPage.vue";
import { toDurationString } from "../common/timeUtils";
import { computed, ref } from "vue";
import {
  PlayCircleIcon,
  StopCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";
import { useEntriesListStore } from "../stores/entriesList";
import { updateEntry } from "../common/supabaseClient";

const props = defineProps<{ entry: TimeEntry }>();

const taskName = ref(props.entry.tasks?.name || "");

const entriesListStore = useEntriesListStore();

const emit = defineEmits<{
  close: [];
}>();

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

const onSaveClick = async () => {
  if (!props.entry.tasks) return;

  //task must have a name
  if (!taskName.value) return;

  //make a clone of the entry
  const oldEntry = { ...props.entry };
  const newEntry = { ...props.entry };
  //update values on the clone
  newEntry.tasks = { ...props.entry.tasks, name: taskName.value };

  entriesListStore.updateEntry(newEntry);
  emit("close");

  //optimistically update the entry on the store
  if (!(await updateEntry(newEntry))) {
    //if update is not successful, revert
    entriesListStore.updateEntry(oldEntry);
  }
};
</script>
