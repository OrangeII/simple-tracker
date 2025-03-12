<template>
  <!-- Page content -->
  <div
    class="fixed z-50 bg-background overflow-auto"
    :class="[
      anchor === 'left' ? 'left-0' : 'right-0',
      isFullWidth ? 'inset-0' : 'top-0 bottom-0',
      !isFullWidth ? widthClass : '',
    ]"
  >
    <header class="p-4 flex flex-row justify-between items-center">
      <div class="flex flex-row items-center gap-4">
        <ArrowLeftIcon
          @click="emit('close')"
          class="size-8 text-primary"
        ></ArrowLeftIcon>
        <h1>{{ title }}</h1>
      </div>
      <slot name="actions"></slot>
    </header>
    <main>
      <slot name="main"></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";

const emit = defineEmits<{
  close: [];
}>();

const props = withDefaults(
  defineProps<{
    title?: string;
    widthClass?: string;
    anchor?: "left" | "right";
  }>(),
  {
    widthClass: "",
    anchor: "right",
  }
);

const isFullWidth = computed(() => !props.widthClass);
</script>
