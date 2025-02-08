<template>
  <div>
    <qrcode-stream
      @detect="onDetect"
      @error="onError"
      @camera-on="onReady"
    ></qrcode-stream>
    <div>value: {{ capturedCode?.rawValue }}</div>
    <div>err: {{ err }}</div>
  </div>
</template>

<script setup>
import { QrcodeStream } from "vue-qrcode-reader";

const capturedCode = ref(null);
const err = ref("");

const onDetect = async (detectedCodes) => {
  console.log(detectedCodes);
  capturedCode.value = detectedCodes[0];
};

const onError = async (error) => {
  error.value = error.name;
};

const onReady = async (capabilities) => {
  err.value;
};
</script>
