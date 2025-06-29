<template>
  <AppPage @close="emit('close')" :anchor="anchor" :widthClass="widthClass">
    <template #title>
      <h1>{{ isNew ? "Create new tag" : "Edit tag" }}</h1>
    </template>
    <template #actions>
      <div class="flex gap-4 items-center">
        <div class="flex gap-1 items-center cursor-pointer" @click="saveTag">
          <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
          <h3 class="uppercase text-primary">save</h3>
        </div>
      </div>
    </template>
    <template #main>
      <div class="p-4 flex flex-col">
        <!-- tag dot preview -->
        <div class="pb-4 flex gap-1 items-center">
          <TagDot v-if="!isNew" :tag="tag"></TagDot>
          <ArrowRightIcon v-if="!isNew" class="size-4 text-text/70" />
          <TagDot
            :tag="{
              name: tagName.toLowerCase() || 'new tag',
              hex_color: tagColor,
              dot_text: tagDotText,
            }"
          ></TagDot>
        </div>
        <!-- tag preview -->
        <div class="pb-4">
          <div class="flex gap-1 items-center">
            <TaskTag
              v-if="!isNew"
              class="w-fit"
              :name="tag.name"
              :hex_color="tag.hex_color"
            />
            <ArrowRightIcon v-if="!isNew" class="size-4 text-text/70" />
            <TaskTag
              class="w-fit"
              :name="tagName.toLowerCase() || 'new tag'"
              :hex_color="tagColor"
            />
          </div>
        </div>

        <!-- tag name -->
        <div class="pb-4">
          <input
            required="true"
            type="text"
            v-model="tagName"
            class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
            placeholder="Tag name"
            :autofocus="isNew"
          />
        </div>

        <!-- tag color picker -->
        <div class="mb-4">
          <div class="flex gap-1 items-center pb-1">
            <PaintBrushIcon class="text-text/70 size-5"></PaintBrushIcon>
            <div class="flex items-center justify-between w-full">
              <h3 class="text-text/70">Color</h3>
              <h3 class="text-text/70">{{ tagColor || "" }}</h3>
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <input
              type="color"
              v-model="tagColor"
              class="p-1 rounded-md grainy bg-background dark:bg-blend-overlay grow font-medium focus:outline-none focus:border-none w-full h-12"
            />
            <CubeIcon
              @click="randomizeColor"
              class="size-8 text-primary cursor-pointer"
            ></CubeIcon>
          </div>
        </div>

        <!-- tag dot text -->
        <div v-if="!isNew" class="mb-4">
          <div class="flex gap-1 items-center pb-1">
            <div class="size-5 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-text/70"></div>
            </div>
            <h3 class="text-text/70">Icon text</h3>
          </div>
          <input
            type="text"
            v-model="tagDotText"
            class="w-full p-2 rounded-md bg-background caret-primary dark:bg-blend-overlay grainy font-medium text-lg focus:outline-none"
            placeholder="optional icon text (example: '🍕')"
          />
        </div>

        <!-- tag stats -->
        <div v-if="!isNew" class="mb-4">
          <div class="flex gap-1 items-center pb-1">
            <ChartBarIcon class="text-text/70 size-5"></ChartBarIcon>
            <h3 class="text-text/70">Stats</h3>
          </div>
          <TagStats :tagId="tag.id" />
        </div>

        <!-- tag delete button -->
        <div class="flex items-center justify-around">
          <div
            v-if="!isNew"
            class="flex gap-1 items-center cursor-pointer"
            @click="deleteTagConfirm"
          >
            <TrashIcon class="size-8 text-accent"></TrashIcon>
            <h3 class="uppercase text-accent">delete</h3>
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
import {
  CheckCircleIcon,
  PaintBrushIcon,
  ChartBarIcon,
  CubeIcon,
} from "@heroicons/vue/24/solid";
import TaskTag from "./TaskTag.vue";
import { ArrowRightIcon, TrashIcon } from "@heroicons/vue/24/solid";
import TagStats from "./TagStats.vue";
import { generateRandomColor } from "../common/colorUtils";
import TagDot from "./TagDot.vue";

const props = defineProps<{
  title?: string;
  tag: Tag;
  anchor?: "left" | "right";
  widthClass?: string;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "tag-updated": [tag: Tag];
  "tag-created": [tag: Tag];
}>();

const tagsStore = useTagsStore();
const tagName = ref(props.tag.name);
const tagColor = ref(props.tag.hex_color || "#888888");
const tagDotText = ref(props.tag.dot_text || "");

const randomizeColor = () => {
  tagColor.value = generateRandomColor();
};

const saveTag = async () => {
  if (!tagName.value.trim()) {
    return; // Don't save empty tag names
  }

  if (props.isNew) {
    // Create new tag
    const newTag = await tagsStore.addTag(tagName.value.trim(), tagColor.value);
    if (newTag) {
      emit("tag-created", newTag);
      emit("close");
    }
  } else {
    // Update existing tag
    const updatedTag = {
      ...props.tag,
      name: tagName.value.trim(),
      hex_color: tagColor.value,
      dot_text: tagDotText.value.trim(),
    };

    const success = await tagsStore.updateTag(updatedTag);
    if (success) {
      emit("tag-updated", updatedTag);
      emit("close");
    }
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
