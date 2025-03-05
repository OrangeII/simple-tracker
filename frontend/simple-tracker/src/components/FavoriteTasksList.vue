<template>
  <div class="pt-4 px-4 font-bold uppercase">favorites</div>
  <div v-for="task in favoriteTasksStore.favorites" :key="task.id">
    <EntriesListItemLayout>
      <template #left>
        <h3 class="truncate">{{ task.name }}</h3>
      </template>
      <template #actions>
        <div class="flex items-center pr-1">
          <div
            class="h-full flex flex-col items-center"
            @click="onFavorite(task)"
          >
            <StarIcon class="size-8 text-primary"></StarIcon>
            <h4>Remove</h4>
          </div>
        </div>
      </template>
    </EntriesListItemLayout>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../common/types";
import { useFavoriteTasksStore } from "../stores/favoriteTasks";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import { StarIcon } from "@heroicons/vue/24/outline";

const favoriteTasksStore = useFavoriteTasksStore();

const onFavorite = async (task: Task) => {
  //remove task from favorites
  favoriteTasksStore.removeFavorite(task);
};
</script>
