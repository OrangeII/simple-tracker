<template>
  <div class="flex items-center pr-1">
    <div
      @click.stop="$emit('onFavoriteClick')"
      class="cursor-pointer h-full flex flex-col items-center"
    >
      <div class="size-8 text-primary">
        <StarIcon v-if="isFavorite"></StarIcon>
        <StarIconOutline v-else="isFavorite"></StarIconOutline>
      </div>
      <h4 class="text-primary">{{ text }}</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StarIcon } from "@heroicons/vue/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/vue/24/outline";

withDefaults(
  defineProps<{
    isFavorite: boolean;
    text?: string;
  }>(),
  {
    isFavorite: false,
    text: "Favorite",
  }
);

defineEmits<{
  onFavoriteClick: [void];
}>();
</script>
