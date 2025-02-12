<template>
  <div v-if="message">{{ message }}</div>
  <div class="flex flex-row items-center">
    <div class="pr-2 size-12">
      <QrCodeIcon
        v-if="!loading"
        @click="openQRModal"
        class="w-full h-full text-primary"
      />
      <Spinner v-else class="size-9" />
    </div>
    <div class="flex-grow">
      <input
        type="text"
        v-model="taskName"
        placeholder="Task name"
        class="w-full px-4 py-2 border-1 rounded-sm caret-primary focus:outline-primary"
      />
    </div>
    <div class="pl-2 size-12">
      <PlayIcon
        v-if="!loading"
        @click="start"
        class="w-full h-full text-primary"
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
    <div class="bg-bg rounded-lg shadow-lg max-w-lg w-full p-6">
      <div class="flex justify-between items-center border-b pb-2">
        <h2 class="text-xl font-semibold">Scan a QR</h2>
      </div>

      <div class="mt-4">
        <QRScanner @code-captured="onQRCodeCaptured" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**this component is responsible for starting the tracking on a new task
 * stop current time entry
 * make new task
 * start time entry on new task
 */

import { ref } from "vue";
import { supabase } from "../main.ts";
import { track } from "../common/supabaseClient.ts";
import QRScanner from "./QRScanner.vue";
import { QrCodeIcon, PlayIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";

const taskName = ref("");
const altCode = ref("");
const loading = ref(false);
const message = ref("");
const qrModalIsOpen = ref(false);

const emit = defineEmits(["taskCreated"]);

const start = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  loading.value = true;
  message.value = "";

  await startTrackingTask(null, taskName.value, altCode.value);
};

const startTrackingTask = async (taskId, name, altCode) => {
  const ret = await track({ name, altCode });
  if (!ret) {
    message.value = "Could not start tracking task!";
    loading.value = false;
    return;
  }

  //emit the task created
  emit("taskStarted", ret);
  message.value = "Task started succesfully!";
  taskName.value = "";
  altCode.value = "";
  loading.value = false;
};

const openQRModal = () => {
  qrModalIsOpen.value = true;
};

const closeQRModal = () => {
  qrModalIsOpen.value = false;
};

const onQRCodeCaptured = async (rawCode) => {
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
  await startTrackingTask(code.taskId, code.name, code.altCode);
};
</script>
