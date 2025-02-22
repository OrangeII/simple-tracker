<template>
  <div
    v-for="(dateEntries, date) in entriesListStore.entriesByDate"
    :key="date"
  >
    <div class="pt-4 font-bold uppercase flex flex-row justify-between">
      <div>{{ toEntriesDateString(new Date(date)) }}</div>
      <div>{{ toDurationString(new Date(dateEntries.totalTime)) }}</div>
    </div>

    <div v-if="!grouped">
      <EntriesListItem
        v-for="entry in dateEntries.entries"
        :entry="entry"
        @onResumeClicked="onResume"
      >
      </EntriesListItem>
    </div>
    <div v-else>
      <EntriesListGroupedItem
        v-for="group in dateEntries.entiresById"
        :group="group"
        @onResumeClicked="onResume"
      />
    </div>
  </div>

  <!-- Scroll Trigger (Empty div at bottom for IntersectionObserver) -->
  <div id="scroll-trigger" class="h-4"></div>

  <!-- Loading Indicator -->
  <div v-if="entriesListStore.loading" class="flex flex-row justify-around">
    <Spinner class="mt-4 size-10" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { track } from "../common/supabaseClient.ts";
import { toDurationString, toEntriesDateString } from "../common/timeUtils.ts";
import Spinner from "./Spinner.vue";
import EntriesListItem from "./EntriesListItem.vue";
import EntriesListGroupedItem from "./EntriesListGroupedItem.vue";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useEntriesListStore } from "../stores/entriesList";
import type { TimeEntry } from "../common/types.ts";

const observer = ref<IntersectionObserver | null>(null);
const entriesListStore = useEntriesListStore();
const currentTaskStore = useCurrentTaskStore();

const { grouped = false } = defineProps<{
  grouped: boolean;
}>();

onMounted(async () => {
  entriesListStore.fetchEntries();
  observer.value = new IntersectionObserver(observerCallBack, {
    rootMargin: "100px",
  });

  const sentinel = document.getElementById("scroll-trigger");
  if (sentinel) observer.value.observe(sentinel);
});

const observerCallBack = (intersections: IntersectionObserverEntry[]) => {
  if (intersections[0].isIntersecting) {
    entriesListStore.fetchEntries();
  }
};

const onResume = async (entry: TimeEntry) => {
  if (!entry.tasks) return;

  entry.loading = true;
  const startTime = new Date();

  //optimistically change the store
  currentTaskStore.task = {
    user_id: entry.user_id,
    task_id: entry.task_id,
    time_entry_id: "",
    tasks: entry.tasks,
    time_entries: {
      id: "",
      task_id: entry.task_id,
      user_id: entry.user_id,
      start_time: startTime.toISOString(),
      created_at: startTime.toISOString(),
    },
  };

  const ret = await track({ taskId: entry.tasks.id, startTime });
  if (!ret) {
    entry.loading = false;
    //reverse the optimistic change
    currentTaskStore.task = null;
    return;
  }

  //update store with the actual task
  currentTaskStore.task = ret;
  entry.loading = false;
};
</script>
