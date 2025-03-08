<template>
  <div class="relative overflow-hidden">
    <div
      ref="actionsContainer"
      class="absolute right-0 top-0 h-full flex items-center px-4 gap-6"
    >
      <slot name="actions">
        <div class="flex items-center pr-1">
          <div
            @click="$emit('onFavoriteClick')"
            class="h-full flex flex-col items-center"
          >
            <StarIcon v-if="isFavorite" class="size-8 text-primary"></StarIcon>
            <StarIconOutline
              v-else="isFavorite"
              class="size-8 text-primary"
            ></StarIconOutline>
            <h4>Favorite</h4>
          </div>
        </div>
        <div class="flex items-center pr-1">
          <div
            @click="$emit('onDelete')"
            class="h-full flex flex-col items-center"
          >
            <TrashIcon class="size-8 text-accent"></TrashIcon>
            <h4>Delete</h4>
          </div>
        </div>
      </slot>
    </div>
    <div
      class="rounded-sm p-2 my-1.5 flex flex-row justify-between items-center bg-background grainy dark:bg-blend-overlay min-h-18"
      :style="{ transform: `translateX(${offset}px)` }"
      :class="{ 'transition-transform': !isSwiping }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="flex-grow max-w-[75%]" @click="$emit('onClick')">
        <slot name="left"></slot>
      </div>

      <div @click="$emit('onResume')" class="flex flex-col items-end">
        <div>
          <slot name="duration"></slot>
        </div>
        <div color="flex flex-col items-center">
          <PlayIcon v-if="!hidePlay && !loading" class="size-8 text-primary" />
          <Spinner v-if="loading" class="size-8" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Spinner from "./Spinner.vue";
import { PlayIcon, TrashIcon, StarIcon } from "@heroicons/vue/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/vue/24/outline";

withDefaults(
  defineProps<{
    loading?: boolean;
    isFavorite?: boolean;
    hidePlay?: boolean;
  }>(),
  {
    loading: false,
    isFavorite: false,
    hidePlay: false,
  }
);

defineEmits<{
  onResume: void;
  onDelete: void;
  onClick: void;
  onFavoriteClick: void;
}>();

const actionsContainer = useTemplateRef("actionsContainer");

const isSwipeOpen = ref(false);
const isSwiping = ref(false);
const isScrolling = ref(false);
const startX = ref(0);
const currentX = ref(0);
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
//theese are negative numbers because we are translating to the left
const offset = ref(0);
const SWIPE_THRESHOLD = -60;

const onTouchStart = (e: TouchEvent) => {
  isSwiping.value = false;
  isScrolling.value = false;
  startX.value = e.touches[0].clientX;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
};

const onTouchMove = (e: TouchEvent) => {
  //check if there is scrolling or swiping
  if (!isScrolling.value && !isSwiping.value) {
    //if more horizontal than vertical then it's swiping, otherwise it's scrolling
    if (
      Math.abs(e.touches[0].clientX - touchStartX.value) >
      Math.abs(e.touches[0].clientY - touchStartY.value)
    ) {
      isSwiping.value = true;
    } else {
      isScrolling.value = true;
    }
  }

  //is swiping handle swiping logic
  if (isSwiping.value) {
    currentX.value = e.touches[0].clientX;
    const diff = startX.value - currentX.value;
    offset.value += -diff;
    startX.value = currentX.value;
  }
};

const onTouchEnd = (e: TouchEvent) => {
  if (!isSwiping.value) return;

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
  const maxSwipe = -(actionsContainer?.value?.clientWidth || 100);
  offset.value = maxSwipe;
  isSwipeOpen.value = true;
};
</script>
