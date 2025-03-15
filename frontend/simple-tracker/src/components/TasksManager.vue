<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        class="flex-grow rounded-md p-2 bg-background dark:bg-blend-overlay grainy font-medium text-lg focus:outline-none"
        placeholder="Search tasks..."
      />

      <button
        @click="createNewTask"
        class="bg-background text-primary rounded-md border-primary border-1 p-2 flex items-center gap-1 hover:opacity-90"
      >
        <PlusCircleIcon class="size-6" />
        New
      </button>
    </div>

    <!-- tasks in a grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <TaskCard
        v-for="task in tasksStore.tasks"
        :key="task.id"
        :task="task"
      ></TaskCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";
import { useTasksStore } from "../stores/tasks";
import TaskCard from "./TaskCard.vue";

const tasksStore = useTasksStore();
const searchQuery = ref("");

const createNewTask = () => {
  console.log("Creating new task...");
};
</script>
