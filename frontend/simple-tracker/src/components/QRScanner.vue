<template>
  <div>
    <qrcode-stream @detect="onDetect" @error="onError"></qrcode-stream>
    <div>err: {{ err }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  QrcodeStream,
  type DetectedBarcode,
  type EmittedError,
} from "vue-qrcode-reader";

const err = ref("");

const emit = defineEmits<{
  codeCaptured: [code: string];
}>();

const onDetect = async (detectedCodes: DetectedBarcode[]) => {
  emit("codeCaptured", detectedCodes[0].rawValue);
};

const onError = async (error: EmittedError) => {
  err.value = error.name;
};
</script>
