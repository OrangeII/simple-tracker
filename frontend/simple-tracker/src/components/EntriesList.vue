<template>
  <!-- Loading state -->
  <EntriesListSkeleton
    v-if="entriesListStore.loading && entriesListStore.entries.length === 0"
  />

  <!-- Empty state -->
  <div
    v-else-if="entriesListStore.entries.length === 0"
    class="flex flex-col items-center justify-center h-full mt-[40%]"
  >
    <div class="text-2xl font-bold">No entries yet</div>
    <div class="text-text/70">Start tracking to see your entries</div>
  </div>

  <!-- Entries list -->
  <div v-else>
    <div
      v-for="(dateEntries, date) in entriesListStore.entriesByDate"
      :key="date"
    >
      <div class="pt-4 px-4 font-bold uppercase flex flex-row justify-between">
        <div>{{ toEntriesDateString(new Date(date)) }}</div>
        <div>{{ toDurationString(new Date(dateEntries.totalTime)) }}</div>
      </div>

      <div v-if="!grouped">
        <TransitionGroup name="list-slide-left">
          <EntriesListItem
            v-for="entry in dateEntries.entries"
            :key="entry.id"
            :entry="entry"
            class="px-4"
            @onResumeClicked="onResume"
            @onDeleteClicked="onDeleteEntry"
            @onClick="onEntryClick(entry)"
            @onFavoriteClicked="onFavoriteClicked"
          >
          </EntriesListItem>
        </TransitionGroup>
      </div>
      <div v-else>
        <TransitionGroup name="list-slide-left">
          <EntriesListGroupedItem
            v-for="group in dateEntries.entiresById"
            :key="group.id"
            :group="group"
            class="px-4"
            @onResumeClicked="onResume"
            @onDeleteClicked="onDeleteGroup"
            @onClick="onGroupClick(group)"
            @onFavoriteClicked="onFavoriteClicked"
          />
        </TransitionGroup>
      </div>
    </div>

    <Transition name="page-slide">
      <AppPageEntryDetail
        v-if="detailPageEntry !== null"
        @close="detailPageEntry = null"
        :entry="detailPageEntry"
      ></AppPageEntryDetail>
    </Transition>
    <Transition name="page-slide">
      <AppPageGroupDetail
        v-if="detailPageGroup !== null"
        @close="detailPageGroup = null"
        :group="detailPageGroup"
      ></AppPageGroupDetail>
    </Transition>

    <!-- Loading Indicator -->
    <div v-if="entriesListStore.loading" class="flex flex-row justify-around">
      <Spinner class="mt-4 size-10" />
    </div>
  </div>
  <!-- Scroll Trigger (Empty div at bottom for IntersectionObserver) -->
  <div id="scroll-trigger" class="h-4"></div>
</template>

<style scoped></style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { deleteEntry } from "../common/supabaseClient.ts";
import { toDurationString, toEntriesDateString } from "../common/timeUtils.ts";
import Spinner from "./Spinner.vue";
import EntriesListItem from "./EntriesListItem.vue";
import EntriesListGroupedItem from "./EntriesListGroupedItem.vue";
import { useCurrentTaskStore } from "../stores/currentTask";
import { useEntriesListStore } from "../stores/entriesList";
import type { TaskGroup, TimeEntry } from "../common/types.ts";
import AppPageEntryDetail from "./AppPageEntryDetail.vue";
import AppPageGroupDetail from "./AppPageGroupDetail.vue";
import { useFavoriteTasksStore } from "../stores/favoriteTasks.ts";
import EntriesListSkeleton from "./EntriesListSkeleton.vue";

const observer = ref<IntersectionObserver | null>(null);
const entriesListStore = useEntriesListStore();
const currentTaskStore = useCurrentTaskStore();
const favoriteTasksStore = useFavoriteTasksStore();

const detailPageEntry = ref<TimeEntry | null>(null);
const detailPageGroup = ref<TaskGroup | null>(null);

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
  await currentTaskStore.track(entry.tasks);
};

const onDeleteEntry = async (entry: TimeEntry) => {
  if (!entry.tasks) return;

  //optimistically remove the entry
  entriesListStore.removeEntries([entry]);

  //delete the entry form the database
  if (!(await deleteEntry(entry.id))) {
    //revert the optimistic change if deletion fails
    entriesListStore.pushEntries([entry]);
  }
};

const onDeleteGroup = async (group: TaskGroup) => {
  if (!group.entries[0].tasks) return;

  //optimistically remove the group
  entriesListStore.removeEntries(group.entries);

  //delete the group from the database
  for (const entry of group.entries) {
    if (!(await deleteEntry(entry.id))) {
      //revert the optimistic change if deletion fails
      entriesListStore.pushEntries([entry]);
    }
  }
};

const onGroupClick = (group: TaskGroup) => {
  if (group.entries.length == 1) {
    detailPageEntry.value = group.entries[0];
  } else {
    detailPageGroup.value = group;
  }
};
const onEntryClick = (entry: TimeEntry) => {
  detailPageEntry.value = entry;
};

const onFavoriteClicked = async (entry: TimeEntry) => {
  if (!entry.tasks) return;

  favoriteTasksStore.toggle(entry.tasks);
};
</script>
