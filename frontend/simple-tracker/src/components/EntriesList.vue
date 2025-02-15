<template>
  <div v-for="(dateEntries, date) in entriesByDate" :key="date">
    <div class="pt-4 font-bold uppercase">
      {{ getEntriesDateString(new Date(date)) }}
    </div>

    <div
      v-for="entry in dateEntries"
      :key="entry.id"
      class="border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between"
    >
      <div class="flex-grow max-w-[65%]">
        <h3 class="truncate">{{ entry.tasks.name }}</h3>
        <p>{{ new Date(entry.start_time).toLocaleDateString() }}</p>
      </div>

      <div
        v-if="entry.end_time"
        @click="onResume(entry)"
        class="flex flex-col items-end"
      >
        <div>
          {{
            toTimeString(new Date(entry.end_time) - new Date(entry.start_time))
          }}
        </div>
        <div color="flex flex-col items-center">
          <PlayIcon v-if="!entry.loading" class="size-8 text-primary" />
          <Spinner v-else class="size-8" />
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll Trigger (Empty div at bottom for IntersectionObserver) -->
  <div id="scroll-trigger" class="h-4"></div>

  <!-- Loading Indicator -->
  <Spinner v-if="loading" class="text-center mt-4 size-10" />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getEntries, track } from "../common/supabaseClient.ts";
import { toTimeString } from "../common/timeUtils.ts";
import Spinner from "./Spinner.vue";
import { PlayIcon } from "@heroicons/vue/24/solid";

const limit = 10;
const page = ref(0);
const loading = ref(false);
const entries = ref([]);
const observer = ref(null);

const emit = defineEmits(["taskResumed"]);

onMounted(async () => {
  fetchEntries();
  observer.value = new IntersectionObserver(observerCallBack, {
    rootMargin: "100px",
  });

  const sentinel = document.getElementById("scroll-trigger");
  if (sentinel) observer.value.observe(sentinel);
});

const fetchEntries = async () => {
  if (loading.value) return;
  loading.value = true;

  const newEntries = await getEntries(limit, page.value);
  if (!newEntries || newEntries.length == 0) {
    loading.value = false;
    return;
  }

  newEntries.forEach((entry) => {
    entry.loading = false;
  });

  entries.value.push(...newEntries);
  page.value++;
  loading.value = false;
};

const entriesByDate = computed(() => {
  const days = {};
  for (const entry of entries.value) {
    //get entry start date
    const date = new Date(entry.start_time);
    date.setHours(0, 0, 0, 0);

    //group entries by start date
    if (!days[date]) {
      days[date] = [entry];
    } else {
      days[date].push(entry);
    }
  }
  return days;
});

const getEntriesDateString = (date) => {
  const entriesDate = new Date(date);
  entriesDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (entriesDate.getTime() === today.getTime()) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (entriesDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return entriesDate.toLocaleDateString();
};

const observerCallBack = (entries) => {
  if (entries[0].isIntersecting) {
    fetchEntries();
  }
};

const onResume = async (entry) => {
  entry.loading = true;
  const ret = await track({ taskId: entry.tasks.id });
  if (!ret) {
    entry.loading = false;
    return;
  }

  emit("taskResumed", ret);
  entry.loading = false;
};
</script>
