<template>
  <button :class="buttonClasses">
    <div v-if="$slots.icon" class="size-6">
      <slot name="icon"></slot>
    </div>
    <div class="uppercase">
      <slot></slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value: string) =>
      ["primary", "secondary", "accent"].includes(value),
  },
});

const buttonClasses = computed(() => [
  "flex",
  "gap-2",
  "align-center",
  "items-center",
  "border-1",
  "rounded-md",
  "cursor-pointer",
  `border-${props.variant}`,
  `text-${props.variant}`,
  `hover:bg-${props.variant ?? "primary"}/20`,
]);
</script>

<style scoped></style>
