<template>
  <div class="relative overflow-hidden">
    <div
      ref="actionsContainer"
      class="absolute right-0 top-0 h-full flex items-center px-4 gap-6"
    >
      <slot name="actions">
        <AppButtonFavorite
          v-if="!hideFavorite"
          @on-favorite-click="$emit('onFavoriteClick')"
          :isFavorite="isFavorite"
        />
        <AppButtonDelete v-if="!hideDelete" @on-delete="$emit('onDelete')" />
      </slot>
    </div>
    <div
      class="hover:outline-1 hover:outline-text/30 rounded-sm p-2 my-1.5 flex flex-row justify-between items-center bg-background grainy dark:bg-blend-overlay min-h-18 overflow-hidden"
      :style="{ transform: `translateX(${offset}px)` }"
      :class="{ 'transition-transform': !isSwiping }"
      @click="$emit('onClick')"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mouseover="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- actions toolbar -->
      <Transition>
        <div
          ref="actionsContainerDesktop"
          class="h-full flex items-center px-4 gap-6 flex-none"
          v-if="isDesktop && isHovering"
        >
          <slot name="actions">
            <AppButtonDelete
              v-if="!hideDelete"
              @on-delete="$emit('onDelete')"
            />
            <AppButtonFavorite
              v-if="!hideFavorite"
              @on-favorite-click="$emit('onFavoriteClick')"
              :isFavorite="isFavorite"
            />
          </slot>
        </div>
      </Transition>

      <div class="flex-1 min-w-0 overflow-hidden text-ellipsis mr-2">
        <slot name="left"></slot>
      </div>

      <div
        @click.stop="$emit('onResume')"
        class="flex flex-col items-end cursor-pointer flex-none"
      >
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
import { PlayIcon } from "@heroicons/vue/24/solid";
import AppButtonFavorite from "./AppButtonFavorite.vue";
import AppButtonDelete from "./AppButtonDelete.vue";
import { useBreakpoints } from "../common/breakpoints";

withDefaults(
  defineProps<{
    loading?: boolean;
    isFavorite?: boolean;
    hidePlay?: boolean;
    hideFavorite?: boolean;
    hideDelete?: boolean;
  }>(),
  {
    loading: false,
    isFavorite: false,
    hidePlay: false,
    hideFavorite: false,
    hideDelete: false,
  }
);

defineEmits<{
  onResume: void;
  onDelete: void;
  onClick: void;
  onFavoriteClick: void;
}>();

const actionsContainer = useTemplateRef("actionsContainer");
const { isDesktop } = useBreakpoints();

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

const isHovering = ref(false);

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
