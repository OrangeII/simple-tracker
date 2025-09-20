<template>
  <div class="flex items-center pr-1">
    <div
      @click.stop="$emit('onDelete')"
      class="cursor-pointer h-full flex flex-col items-center"
    >
      <TrashIcon class="size-8 text-accent"></TrashIcon>
      <h4 v-if="!hideCaption" class="text-accent">Delete</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/solid";

withDefaults(
  defineProps<{
    text?: string;
    hideCaption?: boolean;
  }>(),
  {
    text: "Delete",
    hideCaption: false,
  }
);

defineEmits<{
  onDelete: [void];
}>();
</script>
