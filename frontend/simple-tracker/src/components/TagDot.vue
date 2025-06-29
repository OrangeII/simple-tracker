<template>
  <div
    v-if="!tag.dot_text"
    class="w-2 h-2 rounded-full"
    :style="{
      backgroundColor: tag.hex_color,
    }"
  ></div>
  <div v-else>
    <div class="text-xs font-bold" :style="{ color: tag.hex_color }">
      {{ tag.dot_text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from "../common/types";

defineProps<{
  tag:
    | Tag
    | {
        name: string;
        hex_color?: string | undefined;
        dot_text?: string | undefined;
      };
}>();
</script>
