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
        New Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";

const searchQuery = ref("");

const createNewTask = () => {
  console.log("Creating new task...");
};
</script>
