<template>
  <div class="relative overflow-hidden">
    <div class="absolute right-0 top-0 h-full flex items-center">
      <div @click="onActionsClicked">ACTIONS</div>
    </div>
    <div
      class="rounded-sm p-2 my-1.5 flex flex-row justify-between items-center bg-background grainy dark:bg-blend-overlay"
      :style="{ transform: `translateX(${offset}px)` }"
      :class="{ 'transition-transform': !isSwiping }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
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

const isSwipeOpen = ref(false);
const isSwiping = ref(false);
const startX = ref(0);
const currentX = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);
//theese are negative numbers because we are translating to the left
const offset = ref(0);
const SWIPE_THRESHOLD = -60;
const MAX_SWIPE = -200;

const onTouchStart = (e: TouchEvent) => {
  isSwiping.value = true;
  startX.value = e.touches[0].clientX;
  touchStartX.value = e.touches[0].clientX;
};

const onTouchMove = (e: TouchEvent) => {
  currentX.value = e.touches[0].clientX;
  const diff = startX.value - currentX.value;
  offset.value += -diff;
  startX.value = currentX.value;
};

const onTouchEnd = (e: TouchEvent) => {
  isSwiping.value = false;
  touchEndX.value = e.changedTouches[0].clientX;
  const touchDiff = touchEndX.value - touchStartX.value;
  if (touchDiff < SWIPE_THRESHOLD) {
    openSwipe();
  } else {
    closeSwipe();
  }
};

const closeSwipe = () => {
  offset.value = 0;
  isSwipeOpen.value = false;
};

const openSwipe = () => {
  offset.value = MAX_SWIPE;
  isSwipeOpen.value = true;
};

const onActionsClicked = () => {
  console.log("onActionsClicked");
};
</script>
