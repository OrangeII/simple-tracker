<template>
  <div v-if="message">{{ message }}</div>
  <div class="flex flex-row items-center">
    <div class="pr-2 size-12 flex items-center">
      <QrCodeIcon
        v-if="!loading"
        @click="openQRModal"
        class="w-full h-full text-primary cursor-pointer"
      />
      <Spinner v-else class="size-9" />
    </div>
    <div class="flex-grow">
      <AppTextSelect
        v-model="taskName"
        placeholder="Let's start working on..."
        :items="taskStore.tasks"
        searchBy="name"
        itemKey="id"
        dropdown-position="above"
        :showAddNew="false"
        @select="startTrackingTask({ taskId: $event.id, name: $event.name })"
      ></AppTextSelect>
    </div>
    <div class="pl-2 size-12 flex items-center">
      <PlayIcon
        v-if="!loading"
        @click="start"
        class="w-full h-full text-primary cursor-pointer"
      />
      <Spinner v-else class="size-9" />
    </div>
  </div>

  <div
    id="qr-modal"
    v-if="qrModalIsOpen"
    @click.self="closeQRModal"
    class="fixed inset-0 flex items-center justify-center bg-black"
  >
    <div class="bg-background rounded-lg shadow-lg max-w-lg w-full p-6">
      <div class="flex justify-between items-center border-b pb-2">
        <h2 class="text-xl font-semibold">Scan a QR</h2>
      </div>

      <div class="mt-4">
        <QRScanner @code-captured="onQRCodeCaptured" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**this component is responsible for starting the tracking on a new task
 * stop current time entry
 * make new task
 * start time entry on new task
 */

import { onMounted, ref } from "vue";
import { track } from "../common/supabaseClient.ts";
import QRScanner from "./QRScanner.vue";
import { QrCodeIcon, PlayIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useTasksStore } from "../stores/tasks.ts";
import AppTextSelect from "./AppTextSelect.vue";

const taskName = ref("");
const taskAltCode = ref("");
const loading = ref(false);
const message = ref("");
const qrModalIsOpen = ref(false);
const currentTaskStore = useCurrentTaskStore();
const taskStore = useTasksStore();

onMounted(async () => {
  await taskStore.loadTasks();
});

const start = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  await startTrackingTask({ name: taskName.value, altCode: taskAltCode.value });
};

const startTrackingTask = async (params: {
  taskId?: string;
  name?: string;
  altCode?: string;
}) => {
  loading.value = true;
  message.value = "";

  const startTime = new Date();

  //optimistically change the store
  currentTaskStore.task = {
    user_id: "",
    task_id: params.taskId || "",
    time_entry_id: "",
    tasks: {
      id: params.taskId || "",
      name: params.name || params.altCode || "",
      created_at: startTime.toISOString(),
      user_id: "",
      is_favorite: false,
    },
    time_entries: {
      id: "",
      task_id: params.taskId || "",
      user_id: "",
      start_time: startTime.toISOString(),
      created_at: startTime.toISOString(),
    },
  };

  const ret = await track({ ...params, startTime });
  if (!ret) {
    message.value = "Could not start tracking task!";
    loading.value = false;
    //revert optimistic change
    currentTaskStore.task = null;
    return;
  }

  //add task to the tasks store in case it was a new task

  //update the store with the actual task
  currentTaskStore.task = ret;
  message.value = "Task started succesfully!";
  taskName.value = "";
  taskAltCode.value = "";
  loading.value = false;
};

const openQRModal = () => {
  qrModalIsOpen.value = true;
};

const closeQRModal = () => {
  qrModalIsOpen.value = false;
};

const onQRCodeCaptured = async (rawCode: string) => {
  qrModalIsOpen.value = false;

  //validate raw code
  let code;
  try {
    code = JSON.parse(rawCode);
  } catch (error) {
    message.value = "Invalid code!";
    return;
  }
  message.value = code.altCode;

  //it should have at least one of theese to be a valid code
  if (!(code.taskId || code.name || code.altCode)) {
    message.value = "Invalid code!";
    return;
  }

  //start tracking the task
  await startTrackingTask({
    taskId: code.taskId,
    name: code.name,
    altCode: code.altCode,
  });
};
</script>
