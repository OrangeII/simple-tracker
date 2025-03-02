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
          required="true"
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
            <input
              required="true"
              type="date"
              name="start-date"
              id="start-date"
              :value="formatDate(start)"
              @change="onStartDateChange"
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium text-lg focus:outline-none focus:border-none"
            />
            <input
              required="true"
              type="time"
              name="start-time"
              id="start-time"
              :value="formatTime(start)"
              @change="onStartTimeChange"
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium text-lg focus:outline-none focus:border-none"
            />
          </div>
        </div>
        <div v-if="stop !== null">
          <div class="flex gap-1 items-center pb-1">
            <StopCircleIcon class="text-text/70 size-5"></StopCircleIcon>
            <h3 class="text-text/70">Stop</h3>
          </div>
          <div class="flex justify-between items-center gap-4">
            <input
              required="true"
              type="date"
              name="stop-date"
              id="stop-date"
              :value="formatDate(stop)"
              @change="onStopDateChange"
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium text-lg focus:outline-none focus:border-none"
            />
            <input
              required="true"
              type="time"
              name="end-time"
              id="end-time"
              :value="formatTime(stop)"
              @change="onEndTimeChange"
              class="p-2 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium text-lg focus:outline-none focus:border-none"
            />
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
import { computed, ref, type Ref } from "vue";
import {
  PlayCircleIcon,
  StopCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";
import { useEntriesListStore } from "../stores/entriesList";
import { updateEntry } from "../common/supabaseClient";

const props = defineProps<{ entry: TimeEntry }>();

const taskName = ref(props.entry.tasks?.name || "");
const start = ref(new Date(props.entry.start_time));
const stop = ref(props.entry.end_time ? new Date(props.entry.end_time) : null);
const duration = computed(() => {
  if (!stop.value) return new Date(0);
  return new Date(stop.value.getTime() - start.value.getTime());
});

const entriesListStore = useEntriesListStore();

const emit = defineEmits<{
  close: [];
}>();

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const formatTime = (date: Date) => {
  return date.toTimeString().split(" ")[0];
};

const onStartDateChange = (event: Event) => {
  setDateFromEvent(event, start);
};
const onStopDateChange = (event: Event) => {
  setDateFromEvent(event, stop);
};

const setDateFromEvent = (
  event: Event,
  dateToBeSet: Ref<Date | null, Date | null>
) => {
  if (!dateToBeSet.value) return;
  const [year, month, day] = (event.target as HTMLInputElement).value.split(
    "-"
  );
  //I have to make a new Date to make computed values update
  const newDate = new Date(dateToBeSet.value);
  newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));

  if (!newDate || isNaN(newDate.getTime())) {
    //revert changes if new date is invalid
    dateToBeSet.value = new Date(dateToBeSet.value);
    return;
  }

  dateToBeSet.value = newDate;
};

const onStartTimeChange = (event: Event) => {
  setTimeFromEvent(event, start);
};
const onEndTimeChange = (event: Event) => {
  setTimeFromEvent(event, stop);
};

const setTimeFromEvent = (
  event: Event,
  timeToBeSet: Ref<Date | null, Date | null>
) => {
  if (!timeToBeSet.value) return;
  let [hours, minutes, seconds] = (
    event.target as HTMLInputElement
  ).value.split(":");
  const newDate = new Date(timeToBeSet.value);
  //Secons might be undefined on mobile
  if (seconds == undefined) {
    seconds = "0";
  }
  newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

  if (!newDate || isNaN(newDate.getTime())) {
    //revert changes if new date is invalid
    timeToBeSet.value = new Date(timeToBeSet.value);
    return;
  }

  timeToBeSet.value = newDate;
};

const onSaveClick = async () => {
  if (!props.entry.tasks) return;

  //task must have a name
  if (!taskName.value) return;

  //start date must be less that or equal to stop date
  if (stop.value) {
    if (start.value > stop.value) return;
  }
  //check if dates are valid
  if (
    isNaN(start.value.getTime()) ||
    (stop.value && isNaN(stop.value.getTime()))
  ) {
    return;
  }

  //make a clone of the entry
  const oldEntry = { ...props.entry };
  const newEntry = { ...props.entry };

  //update values on the clone
  newEntry.tasks = { ...props.entry.tasks, name: taskName.value };
  newEntry.start_time = start.value.toISOString();
  if (stop.value) {
    newEntry.end_time = stop.value.toISOString();
  }

  entriesListStore.updateEntry(newEntry);
  emit("close");

  //optimistically update the entry on the store
  if (!(await updateEntry(newEntry))) {
    //if update is not successful, revert
    entriesListStore.updateEntry(oldEntry);
  }
};
</script>
