<template>
  <div class="fixed inset-0 z-50 bg-background overflow-auto">
    <header class="p-4 flex flex-row items items-center gap-4">
      <ArrowLeftIcon
        @click="emit('close')"
        class="size-8 text-primary"
      ></ArrowLeftIcon>
      <h1>{{ title }}</h1>
    </header>
    <main class="p-4">
      <slot></slot>
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
