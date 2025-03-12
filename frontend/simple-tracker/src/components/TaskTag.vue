<template>
  <div
    class="cursor-pointer py-1 px-2 rounded-md border-1 border-text/30 flex gap-2 items-center justify-between"
    :style="hex_color ? { borderColor: hex_color } : null"
  >
    <slot name="icon"> </slot>
    <div>
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  hex_color?: string | undefined;
}>();
</script>
