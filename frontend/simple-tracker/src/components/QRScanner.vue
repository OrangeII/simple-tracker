<template>
  <div>
    <qrcode-stream
      @detect="onDetect"
      @error="onError"
      @camera-on="onReady"
    ></qrcode-stream>
    <div>err: {{ err }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";

const err = ref("");

const emit = defineEmits(["codeCaptured"]);

const onDetect = async (detectedCodes) => {
  emit("codeCaptured", detectedCodes[0].rawValue);
};

const onError = async (error) => {
  error.value = error.name;
};

const onReady = async (capabilities) => {
  err.value;
};
</script>
