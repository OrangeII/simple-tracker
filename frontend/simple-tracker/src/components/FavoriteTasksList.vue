<template>
  <div class="pt-4 px-4 font-bold uppercase">favorites</div>
  <div v-for="task in favoriteTasksStore.favorites" :key="task.id">
    {{ task.name }}
  </div>
</template>

<script setup lang="ts">
import { useFavoriteTasksStore } from "../stores/favoriteTasks";

const favoriteTasksStore = useFavoriteTasksStore();
</script>
