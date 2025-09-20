<template>
  <div
    @click.stop="$emit('onResume')"
    class="flex flex-col cursor-pointer flex-none"
    :class="suppressFlexEnd ? '' : 'items-end'"
  >
    <div>
      <slot name="duration"></slot>
    </div>
    <div color="flex flex-col items-center">
      <PlayIcon v-if="!hidePlay && !loading" class="size-8 text-primary" />
      <Spinner v-if="loading" class="size-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon } from "@heroicons/vue/24/solid";
import Spinner from "./Spinner.vue";

withDefaults(
  defineProps<{
    hidePlay?: boolean;
    loading?: boolean;
    suppressFlexEnd?: boolean;
  }>(),
  {
    hidePlay: false,
    loading: false,
    suppressFlexEnd: false,
  }
);

defineEmits<{
  onResume: [void];
}>();
</script>
