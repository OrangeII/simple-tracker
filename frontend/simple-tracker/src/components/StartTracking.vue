<template>
  <div class="p-4 border-t border-text/10">
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
          @select="currentTaskStore.track($event)"
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
  </div>
</template>

<script setup lang="ts">
/**this component is responsible for starting the tracking on a new task
 * stop current time entry
 * make new task
 * start time entry on new task
 */

import { ref } from "vue";
import QRScanner from "./QRScanner.vue";
import { QrCodeIcon, PlayIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";
import { useCurrentTaskStore } from "../stores/currentTask.ts";
import { useTasksStore } from "../stores/tasks.ts";
import AppTextSelect from "./AppTextSelect.vue";

const taskName = ref("");
const taskAltCode = ref("");
const loading = ref(false);
const message = ref("");
const qrModalIsOpen = ref(false);
const currentTaskStore = useCurrentTaskStore();
const taskStore = useTasksStore();

const start = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  await currentTaskStore.trackNew(taskName.value, taskAltCode.value);
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

  if (code.taskId) {
    //if it has taskId, we can track it directly
    const task = taskStore.get(code.taskId);
    if (!task) {
      message.value = "Task not found!";
      return;
    }
    await currentTaskStore.track(task);
  } else {
    //otherwise we create a new task with the name and altCode
    await currentTaskStore.trackNew(code.name || "", code.altCode || "");
  }
};
</script>
