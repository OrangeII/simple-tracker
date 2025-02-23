<template>
  <div
    class="relative border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between items-center bg-bg grainy"
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
</template>

<script setup lang="ts">
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  onResume: void;
}>();
</script>
