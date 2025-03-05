<template>
  <div class="pt-4 px-4 font-bold uppercase flex gap-1 items-center pb-1">
    <StarIcon class="size-5"></StarIcon>
    <h3 class="truncate">favorites</h3>
  </div>
  <TransitionGroup name="list-slide-left">
    <EntriesListItemLayout
      v-for="task in favoriteTasksStore.favorites"
      :key="task.id"
      @onResume="onResume(task)"
    >
      <template #left>
        <h3 class="truncate">{{ task.name }}</h3>
      </template>
      <template #actions>
        <div class="flex items-center pr-1">
          <div
            class="h-full flex flex-col items-center"
            @click="onFavorite(task)"
          >
            <StartIconOutline class="size-8 text-primary"></StartIconOutline>
            <h4>Remove</h4>
          </div>
        </div>
      </template>
    </EntriesListItemLayout>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { Task } from "../common/types";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useFavoriteTasksStore } from "../stores/favoriteTasks";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import { StarIcon as StartIconOutline } from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/24/solid";

const favoriteTasksStore = useFavoriteTasksStore();
const currentTaskStore = useCurrentTaskStore();

const onResume = async (task: Task) => {
  currentTaskStore.track(task);
};

const onFavorite = async (task: Task) => {
  //remove task from favorites
  favoriteTasksStore.removeFavorite(task);
};
</script>
