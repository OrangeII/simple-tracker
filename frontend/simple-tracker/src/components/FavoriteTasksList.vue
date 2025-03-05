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
import { track } from "../common/supabaseClient";
import type { Task } from "../common/types";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useEntriesListStore } from "../stores/entriesList";
import { useFavoriteTasksStore } from "../stores/favoriteTasks";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import { StarIcon as StartIconOutline } from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/24/solid";

const favoriteTasksStore = useFavoriteTasksStore();
const currentTaskStore = useCurrentTaskStore();
const entriesListStore = useEntriesListStore();

const onResume = async (task: Task) => {
  const startTime = new Date();

  //push the current task to the entries list
  if (currentTaskStore.task) {
    currentTaskStore.task.time_entries.end_time = new Date().toISOString();
    currentTaskStore.task.time_entries.tasks = currentTaskStore.task.tasks;
    entriesListStore.pushEntries([currentTaskStore.task.time_entries]);
    currentTaskStore.task = null;
  }

  //optimistically change the store
  currentTaskStore.task = {
    user_id: task.user_id,
    task_id: task.id,
    time_entry_id: "",
    tasks: task,
    time_entries: {
      id: "",
      task_id: task.id,
      user_id: task.user_id,
      start_time: startTime.toISOString(),
      created_at: startTime.toISOString(),
    },
  };

  const ret = await track({ taskId: task.id, startTime });
  if (!ret) {
    //reverse the optimistic change
    currentTaskStore.task = null;
    return;
  }

  //update store with the actual task
  currentTaskStore.task = ret;
};

const onFavorite = async (task: Task) => {
  //remove task from favorites
  favoriteTasksStore.removeFavorite(task);
};
</script>
