<template>
  <AppPage @close="emit('close')" :anchor="anchor" :widthClass="widthClass">
    <template #title>
      <h1>Edit Task</h1>
    </template>
    <template #actions>
      <div class="flex gap-4 items-center">
        <div
          class="flex gap-1 items-center cursor-pointer"
          @click="deleteTaskConfirm"
        >
          <TrashIcon class="size-8 text-accent"></TrashIcon>
          <h3 class="uppercase text-accent">delete</h3>
        </div>
        <div class="flex gap-1 items-center cursor-pointer" @click="saveTask">
          <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
          <h3 class="uppercase text-primary">save</h3>
        </div>
      </div>
    </template>
    <template #main>
      <div class="p-4">
        <!-- task name -->
        <div class="pb-4">
          <input
            required="true"
            type="text"
            v-model="taskName"
            class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
            placeholder="Tag name"
          />
        </div>
      </div>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppPage from "./AppPage.vue";
import { useTasksStore } from "../stores/tasks";
import { type Task } from "../common/types";
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { TrashIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
  title?: string;
  task: Task;
  anchor?: "left" | "right";
  widthClass?: string;
}>();

const emit = defineEmits<{
  close: [];
  "task-updated": [tag: Task];
}>();

const tasksStore = useTasksStore();
const taskName = ref(props.task.name);

const saveTask = async () => {
  if (!taskName.value.trim()) {
    return; // Don't save empty tag names
  }

  // Update existing tag
  const updatedTask = {
    ...props.task,
    name: taskName.value.trim(),
  };

  // const success = await tasksStore.updateTag(updatedTask);
  // if (success) {
  //   emit("task-updated", updatedTask);
  //   emit("close");
  // }
};

const deleteTaskConfirm = async () => {
  // if (
  //   confirm(`Are you sure you want to delete the task "${props.task.name}"?`)
  // ) {
  //   const success = await tasksStore.removeTag(props.task.id);
  //   if (success) {
  //     emit("close");
  //   }
  // }
};
</script>
