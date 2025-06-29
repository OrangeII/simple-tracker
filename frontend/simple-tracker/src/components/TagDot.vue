<template>
  <div
    :key="tag.id"
    class="w-2 h-2 rounded-full"
    :style="{
      backgroundColor: tag.hex_color,
    }"
  ></div>
</template>

<script setup lang="ts">
import type { Tag } from "../common/types";

defineProps<{
  tag: Tag;
}>();
</script>
