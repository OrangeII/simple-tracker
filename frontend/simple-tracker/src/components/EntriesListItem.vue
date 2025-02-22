<template>
  <div
    :key="entry.id"
    class="border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between items-center"
  >
    <div class="flex-grow max-w-[75%]">
      <h3 class="truncate">{{ entry.tasks.name }}</h3>
    </div>

    <div
      v-if="entry.end_time"
      @click="onResume(entry)"
      class="flex flex-col items-end"
    >
      <div>
        {{
          toDurationString(
            new Date(entry.end_time) - new Date(entry.start_time)
          )
        }}
      </div>
      <div color="flex flex-col items-center">
        <PlayIcon v-if="!entry.loading" class="size-8 text-primary" />
        <Spinner v-else class="size-8" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { toDurationString } from "../common/timeUtils";
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits(["onResumeClicked"]);

const props = defineProps({
  entry: Object,
});

const onResume = () => {
  emit("onResumeClicked", props.entry);
};
</script>
