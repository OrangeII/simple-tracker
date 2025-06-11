<template>
  <div class="pt-4 px-4 font-bold uppercase flex gap-1 items-center pb-1">
    <StarIcon class="size-5"></StarIcon>
    <div>favorites</div>
  </div>
  <TransitionGroup name="list-slide-left">
    <EntriesListItemLayout
      v-for="task in favoriteTasksStore.favorites"
      :key="task.id"
      class="px-4"
      @onResume="onResume(task)"
    >
      <template #left>
        <div class="flex-col">
          <h3 class="truncate">{{ task.name }}</h3>
          <TagDots :task="task" />
        </div>
      </template>
      <template #actions>
        <AppButtonFavorite
          @on-favorite-click="onFavorite(task)"
          :isFavorite="false"
          text="Remove"
        ></AppButtonFavorite>
      </template>
    </EntriesListItemLayout>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { Task } from "../common/types";
import { useCurrentTaskStore } from "../stores/v2/currentTask";
import { useFavoriteTasksStore } from "../stores/favoriteTasks";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import { StarIcon } from "@heroicons/vue/24/solid";
import AppButtonFavorite from "./AppButtonFavorite.vue";
import TagDots from "./TagDots.vue";

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
