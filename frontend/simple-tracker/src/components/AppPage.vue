<template>
  <div class="fixed inset-0 z-50 bg-background overflow-auto">
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

const emit = defineEmits<{
  close: [];
}>();

defineProps<{
  title?: string;
}>();
</script>
