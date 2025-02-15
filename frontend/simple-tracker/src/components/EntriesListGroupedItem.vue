<template>
  <div
    :key="group.id"
    class="border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between"
  >
    <div class="flex-grow max-w-[65%]">
      <h3 class="truncate">{{ group.name }}</h3>
    </div>

    <div @click="onResume()" class="flex flex-col items-end">
      <div>
        {{ toTimeString(new Date(group.totalTime)) }}
      </div>
      <div color="flex flex-col items-center">
        <PlayIcon
          v-if="!group.entries[0].loading"
          class="size-8 text-primary"
        />
        <Spinner v-else class="size-8" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { toTimeString } from "../common/timeUtils";
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits(["onResumeClicked"]);

const props = defineProps({
  group: Object,
});

const onResume = () => {
  emit("onResumeClicked", props.group.entries[0]);
};
</script>
