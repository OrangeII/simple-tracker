<template>
  <AppPage @close="emit('close')" :anchor="anchor" :widthClass="widthClass">
    <template #title>
      <h1>Edit tag</h1>
    </template>
    <template #actions>
      <div class="flex gap-4 items-center">
        <div
          class="flex gap-1 items-center cursor-pointer"
          @click="deleteTagConfirm"
        >
          <TrashIcon class="size-8 text-accent"></TrashIcon>
          <h3 class="uppercase text-accent">delete</h3>
        </div>
        <div class="flex gap-1 items-center cursor-pointer" @click="saveTag">
          <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
          <h3 class="uppercase text-primary">save</h3>
        </div>
      </div>
    </template>
    <template #main>
      <div class="p-4">
        <div class="pb-4">
          <div class="flex gap-1 items-center">
            <TaskTag
              class="w-fit"
              :name="tag.name"
              :hex_color="tag.hex_color"
            />
            <ArrowRightIcon class="size-6 text-text/70" />
            <TaskTag class="w-fit" :name="tagName" :hex_color="tagColor" />
          </div>
        </div>

        <div class="pb-4">
          <input
            required="true"
            type="text"
            v-model="tagName"
            class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
          />
        </div>

        <div class="mb-4">
          <div class="flex gap-1 items-center pb-1">
            <PaintBrushIcon class="text-text/70 size-5"></PaintBrushIcon>
            <div class="flex items-center justify-between w-full">
              <h3 class="text-text/70">Color</h3>
              <h3 class="text-text/70">{{ tagColor || "" }}</h3>
            </div>
          </div>
          <div>
            <input
              type="color"
              v-model="tagColor"
              class="p-1 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium focus:outline-none focus:border-none w-full h-12"
            />
          </div>
        </div>
      </div>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppPage from "./AppPage.vue";
import { useTagsStore } from "../stores/tags";
import { type Tag } from "../common/types";
import { CheckCircleIcon, PaintBrushIcon } from "@heroicons/vue/24/solid";
import TaskTag from "./TaskTag.vue";
import { ArrowRightIcon, TrashIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
  title?: string;
  tag: Tag;
  anchor?: "left" | "right";
  widthClass?: string;
}>();

const emit = defineEmits<{
  close: [];
  "tag-updated": [tag: Tag];
}>();

const tagsStore = useTagsStore();
const tagName = ref(props.tag.name);
const tagColor = ref(props.tag.hex_color || "#888888");

const saveTag = async () => {
  if (!tagName.value.trim()) {
    return; // Don't save empty tag names
  }

  const updatedTag = {
    ...props.tag,
    name: tagName.value.trim(),
    hex_color: tagColor.value,
  };

  const success = await tagsStore.updateTag(updatedTag);
  if (success) {
    emit("tag-updated", updatedTag);
    emit("close");
  }
};

const deleteTagConfirm = async () => {
  if (confirm(`Are you sure you want to delete the tag "${props.tag.name}"?`)) {
    const success = await tagsStore.removeTag(props.tag.id);
    if (success) {
      emit("close");
    }
  }
};
</script>
