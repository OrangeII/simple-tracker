<template>
  <AppPage :title="toDurationString(duration)" @close="emit('close')">
    <template #actions>
      <div class="flex gap-1 items-center cursor-pointer" @click="onSaveClick">
        <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
        <h3 class="uppercase text-primary">save</h3>
      </div>
    </template>
    <template #main>
      <div class="p-4 flex flex-col gap-4">
        <!-- task name -->
        <div>
          <input
            required="true"
            type="text"
            v-model="taskName"
            class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
          />
        </div>

        <!-- entry times -->
        <div class="flex flex-col gap-2">
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
                class="p-2 rounded-md standout grow font-medium text-lg focus:outline-none focus:border-none"
              />
              <input
                required="true"
                type="time"
                name="start-time"
                id="start-time"
                :value="formatTime(start)"
                @change="onStartTimeChange"
                class="p-2 rounded-md standout grow font-medium text-lg focus:outline-none focus:border-none"
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
                class="p-2 rounded-md standout grow font-medium text-lg focus:outline-none focus:border-none"
              />
              <input
                required="true"
                type="time"
                name="end-time"
                id="end-time"
                :value="formatTime(stop)"
                @change="onEndTimeChange"
                class="p-2 rounded-md standout grow font-medium text-lg focus:outline-none focus:border-none"
              />
            </div>
          </div>
        </div>

        <!-- entry notes -->
        <div>
          <div class="flex gap-1 items-center pb-1">
            <DocumentTextIcon class="text-text/70 size-5"></DocumentTextIcon>
            <h3 class="text-text/70">Notes</h3>
          </div>
          <textarea
            v-model="entryNotes"
            class="w-full p-2 rounded-md standout font-medium text-lg focus:outline-none focus:border-none"
            rows="3"
            placeholder="Add notes to this entry..."
          ></textarea>
        </div>

        <!-- task tags -->
        <div>
          <div class="flex gap-1 items-center pb-1">
            <TagIcon class="text-text/70 size-5"></TagIcon>
            <h3 class="text-text/70">Tags</h3>
          </div>
          <TaskTags v-if="task" :taskId="entry.task_id" />
        </div>

        <!-- task stats -->
        <div v-if="preferencesStore.preferences.diplayTaskStats">
          <div class="flex gap-1 items-center pb-1">
            <ChartBarIcon class="text-text/70 size-5"></ChartBarIcon>
            <h3 class="text-text/70">Stats</h3>
          </div>
          <TaskStats v-if="task" :taskId="entry.task_id" />
        </div>

        <!-- actions -->
        <div class="flex items-center justify-around">
          <div
            class="flex gap-1 items-center cursor-pointer"
            @click="openQRModal"
          >
            <QrCodeIcon class="size-8 text-primary"></QrCodeIcon>
            <h3 class="uppercase text-primary">Get QR Code</h3>
          </div>
        </div>
      </div>

      <!-- qrcode modal -->
      <div
        id="qr-modal"
        v-if="qrModalIsOpen"
        @click.self="closeQRModal"
        class="fixed inset-0 flex items-center justify-center bg-black/40"
      >
        <div class="bg-background rounded-lg m-4 p-6 flex flex-col gap-4">
          <!-- qrcode image -->
          <img :src="qrCode" alt="Task QR Code" />

          <!-- alt code -->
          <div>
            <h4 class="text-text/70">Alt. code</h4>
            <div class="flex gap-2">
              <h4>{{ tasksStore.get(entry.task_id)?.alt_code }}</h4>
              <ClipboardIcon
                class="size-5"
                @click="copyAltcodeToClipBoard"
              ></ClipboardIcon>
            </div>
          </div>
        </div>
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
  TagIcon,
  ChartBarIcon,
  QrCodeIcon,
  DocumentTextIcon,
} from "@heroicons/vue/24/solid";
import { ClipboardIcon } from "@heroicons/vue/24/outline";
import { useTimeEntriesStore } from "../stores/timeEntries";
import { useTasksStore } from "../stores/tasks";
import TaskTags from "./TaskTags.vue";
import TaskStats from "./TaskStats.vue";
import { useQRCodesStore } from "../stores/qrcodes";
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { usePreferencesStore } from "../stores/preferences";

const timeEntriesStore = useTimeEntriesStore();
const tasksStore = useTasksStore();
const qrcodesStore = useQRCodesStore();
const preferencesStore = usePreferencesStore();

const props = defineProps<{ entry: TimeEntry }>();
const task = computed(() => {
  return tasksStore.get(props.entry.task_id);
});
const qrData = computed(() => {
  if (!task.value) return "";
  return qrcodesStore.getQrCodeJsonFromTask(task.value);
});
const qrCode = useQRCode(qrData);

const taskName = ref(task.value?.name || "");
const entryNotes = ref(props.entry.notes || "");
const start = ref(new Date(props.entry.start_time));
const stop = ref(props.entry.end_time ? new Date(props.entry.end_time) : null);
const duration = computed(() => {
  if (!stop.value) return new Date(0);
  return new Date(stop.value.getTime() - start.value.getTime());
});
const qrModalIsOpen = ref(false);
const closeQRModal = () => {
  qrModalIsOpen.value = false;
};
const openQRModal = () => {
  qrModalIsOpen.value = true;
};

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
  if (!task.value) return;

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

  const newEntry = { ...props.entry, notes: entryNotes.value };

  //update values on the clone
  newEntry.start_time = start.value.toISOString();
  if (stop.value) {
    newEntry.end_time = stop.value.toISOString();
  }

  timeEntriesStore.update(newEntry);
  if (task.value.name !== taskName.value) {
    //update task name if it has changed
    tasksStore.update({ ...task.value, name: taskName.value });
  }
  emit("close");
};

const copyAltcodeToClipBoard = () => {
  const altCode = tasksStore.get(props.entry.task_id)?.alt_code;
  if (altCode) {
    navigator.clipboard.writeText(altCode);
  }
};
</script>
