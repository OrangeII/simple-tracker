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
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        class="hover:outline-1 hover:outline-text/30 hover:cursor-pointer"
        @click="selectTask(task)"
      ></TaskCard>
    </div>

    <!-- Task detail panel -->
    <Transition :name="isDesktop ? 'list-slide-right' : 'page-slide'">
      <AppPageTask
        v-if="selectedTask"
        :task="selectedTask"
        :key="selectedTask.id || 'new-task'"
        :anchor="isDesktop ? 'right' : 'left'"
        :widthClass="isDesktop ? 'w-128' : ''"
        :class="[isDesktop ? 'border-l border-text/10' : '']"
        @close="selectedTask = null"
        @task-updated="onTaskUpdated"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleIcon } from "@heroicons/vue/24/solid";
import { computed, ref } from "vue";
import { useTasksStore } from "../stores/tasks";
import TaskCard from "./TaskCard.vue";
import { type Task } from "../common/types";
import { useBreakpoints } from "../common/breakpoints";
import AppPageTask from "./AppPageTask.vue";

const { isDesktop } = useBreakpoints();
const tasksStore = useTasksStore();
const searchQuery = ref("");
const selectedTask = ref<Task | null>(null);

const filteredTasks = computed(() => {
  return tasksStore.tasks.filter((task) =>
    task.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const createNewTask = () => {
  console.log("Creating new task...");
};

const selectTask = (task: Task) => {
  selectedTask.value = task;
};

const onTaskUpdated = (task: Task) => {
  selectedTask.value = null;
};
</script>
