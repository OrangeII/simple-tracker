<template>
  <div v-for="(dateEntries, date) in entriesByDate" :key="date">
    <div class="pt-4 font-bold uppercase flex flex-row justify-between">
      <div>{{ getEntriesDateString(new Date(date)) }}</div>
      <div>{{ toTimeString(new Date(dateEntries.totalTime)) }}</div>
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
  <div v-if="loading" class="flex flex-row justify-around">
    <Spinner class="mt-4 size-10" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getEntries, track } from "../common/supabaseClient.ts";
import { toTimeString } from "../common/timeUtils.ts";
import Spinner from "./Spinner.vue";
import EntriesListItem from "./EntriesListItem.vue";
import EntriesListGroupedItem from "./EntriesListGroupedItem.vue";

const limit = 30;
const page = ref(0);
const loading = ref(false);
const entries = ref([]);
const observer = ref(null);

const emit = defineEmits(["taskResumed"]);
const props = defineProps({
  grouped: false,
});

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

  const newEntries = (await getEntries(limit, page.value)).filter(
    (e) => e.end_time
  );
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

/**
 * result follows this format:
 * {
 *  date: {
 * 	  date,
 * 	  total time,
 * 	  entries: [entries],
 * 	  entriesById: {
 * 		  id: {
 * 			  id
 * 			  name
 * 			  totalTime
 *        entries: [entries]
 * 			}
 * 		}
 * 	}
 * }
 *
 */
const entriesByDate = computed(() => {
  const days = {};
  for (const entry of entries.value) {
    //group entries by start date

    //get entry start date
    const date = new Date(entry.start_time);
    date.setHours(0, 0, 0, 0);

    //make a new group if necessary
    if (!days[date]) {
      days[date] = {
        date,
        totalTime: 0,
        entries: [],
        entiresById: {},
      };
    }
    //push entry to date group
    days[date].entries.push(entry);

    //also group entries by id within this date group
    if (!days[date].entiresById[entry.task_id]) {
      days[date].entiresById[entry.task_id] = {
        id: entry.task_id,
        name: entry.tasks.name,
        totalTime: 0,
        entries: [],
      };
    }
    //push entry in the id group
    days[date].entiresById[entry.task_id].entries.push(entry);

    //add tracked time to totals
    if (entry.end_time) {
      const trackedTime = new Date(entry.end_time) - new Date(entry.start_time);
      days[date].totalTime += trackedTime;
      days[date].entiresById[entry.task_id].totalTime += trackedTime;
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
