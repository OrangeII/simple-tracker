<template>
  <div
    class="relative overflow-hidden rounded-sm p-2 my-3 flex flex-row justify-between items-center bg-background grainy dark:bg-blend-overlay"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="absolute right-0 top-0 h-full flex items-center">
      <div>ACTIONS</div>
    </div>

    <div class="flex-grow max-w-[75%]">
      <slot name="left"></slot>
    </div>

    <div @click="$emit('onResume')" class="flex flex-col items-end">
      <div>
        <slot name="duration"></slot>
      </div>
      <div color="flex flex-col items-center">
        <PlayIcon v-if="!loading" class="size-8 text-primary" />
        <Spinner v-else class="size-8" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  onResume: void;
}>();

const startX = ref(0);
const currentX = ref(0);

const onTouchStart = (e: TouchEvent) => {
  startX.value = e.touches[0].clientX;
};

const onTouchMove = (e: TouchEvent) => {
  currentX.value = e.touches[0].clientX;
  const diff = startX.value - currentX.value;
  console.log("touchMove", diff);
};

const onTouchEnd = (e: TouchEvent) => {
  //console.log("touchEnd", e);
};
</script>
