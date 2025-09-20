<template>
  <!-- Loading state -->
  <EntriesListSkeleton
    v-if="timeLineStore.loading && timeLineStore.timeEntries.length === 0"
  />

  <!-- Empty state -->
  <div
    v-else-if="timeLineStore.timeEntries.length === 0"
    class="flex flex-col items-center justify-center h-full mt-[40%]"
  >
    <div class="text-2xl font-bold">No entries yet</div>
    <div class="text-text/70">Start tracking to see your entries</div>
  </div>

  <!-- Entries list -->
  <div v-else>
    <EntriesListDesktop
      v-if="isDesktop"
      :grouped="grouped"
      @onResume="onResume"
      @onDeleteEntry="onDeleteEntry"
      @onEntryClick="onEntryClick"
      @onFavoriteClicked="onFavoriteClicked"
      @onDeleteGroup="onDeleteGroup"
      @onGroupClick="onGroupClick"
    />
    <EntriesListMobile
      v-else
      :grouped="grouped"
      @onResume="onResume"
      @onDeleteEntry="onDeleteEntry"
      @onEntryClick="onEntryClick"
      @onFavoriteClicked="onFavoriteClicked"
      @onDeleteGroup="onDeleteGroup"
      @onGroupClick="onGroupClick"
    />

    <!-- Detail pages -->
    <Transition :name="isDesktop ? 'list-slide-right' : 'page-slide'">
      <AppPageEntryDetail
        :key="detailPageEntry?.id"
        :anchor="isDesktop ? 'right' : ''"
        :widthClass="isDesktop ? 'w-128' : ''"
        :class="[isDesktop ? 'border-l border-text/10' : '']"
        v-if="detailPageEntry !== null"
        @close="detailPageEntry = null"
        :entry="detailPageEntry"
      ></AppPageEntryDetail>
    </Transition>
    <Transition :name="isDesktop ? 'list-slide-right' : 'page-slide'">
      <AppPageGroupDetail
        :key="detailPageGroup?.id"
        :anchor="isDesktop ? 'right' : ''"
        :widthClass="isDesktop ? 'w-128' : ''"
        :class="[isDesktop ? 'border-l border-text/10' : '']"
        v-if="detailPageGroup !== null"
        @close="detailPageGroup = null"
        :group="detailPageGroup"
      ></AppPageGroupDetail>
    </Transition>

    <!-- Loading Indicator -->
    <div v-if="timeLineStore.loading" class="flex flex-row justify-around">
      <Spinner class="mt-4 size-10" />
    </div>
  </div>
  <!-- Scroll Trigger (Empty div at bottom for IntersectionObserver) -->
  <div id="scroll-trigger" class="h-4"></div>
</template>

<style scoped></style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Spinner from "./Spinner.vue";
import { useCurrentTaskStore } from "../stores/currentTask.ts";
import { useTimelineStore } from "../stores/timeline.ts";
import { useTimeEntriesStore } from "../stores/timeEntries.ts";
import type { TaskGroup, TimeEntry } from "../common/types.ts";
import AppPageEntryDetail from "./AppPageEntryDetail.vue";
import AppPageGroupDetail from "./AppPageGroupDetail.vue";
import { useFavoriteTasksStore } from "../stores/favoriteTasks.ts";
import EntriesListSkeleton from "./EntriesListSkeleton.vue";
import { useBreakpoints } from "../common/breakpoints.ts";
import { useTasksStore } from "../stores/tasks.ts";
import EntriesListMobile from "./EntriesListMobile.vue";
import EntriesListDesktop from "./EntriesListDesktop.vue";

const { isDesktop } = useBreakpoints();
const observer = ref<IntersectionObserver | null>(null);
const timeLineStore = useTimelineStore();
const timeEntriesStore = useTimeEntriesStore();
const currentTaskStore = useCurrentTaskStore();
const favoriteTasksStore = useFavoriteTasksStore();
const tasksStore = useTasksStore();

const detailPageEntry = ref<TimeEntry | null>(null);
const detailPageGroup = ref<TaskGroup | null>(null);

const { grouped = false } = defineProps<{
  grouped: boolean;
}>();

onMounted(async () => {
  if (timeLineStore.timeEntries.length === 0) {
    timeLineStore.reset();
    timeLineStore.fetchEntries();
  }

  observer.value = new IntersectionObserver(observerCallBack, {
    rootMargin: "100px",
  });

  const sentinel = document.getElementById("scroll-trigger");
  if (sentinel) observer.value.observe(sentinel);
});

const observerCallBack = (intersections: IntersectionObserverEntry[]) => {
  if (intersections[0].isIntersecting) {
    timeLineStore.fetchEntries();
  }
};

const onResume = async (entry: TimeEntry) => {
  const task = tasksStore.get(entry.task_id);
  if (!task) {
    console.error("Task not found for entry:", entry);
    return;
  }

  await currentTaskStore.track(task);
};

const onDeleteEntry = async (entry: TimeEntry) => {
  const c = confirm("Are you sure you want to delete this entry?");
  if (!c) return;

  timeEntriesStore.remove(entry);
};

const onDeleteGroup = async (group: TaskGroup) => {
  const c = confirm(
    `Are you sure you want do delete ${group.entries.length} entries?`
  );
  if (!c) return;

  //optimistically remove the group
  timeEntriesStore.removeAll(group.entries);
};

const onGroupClick = (group: TaskGroup) => {
  //when clicking on group, clear both entry and group detail
  detailPageEntry.value = null;
  detailPageGroup.value = null;

  if (group.entries.length == 1) {
    detailPageEntry.value = group.entries[0];
  } else {
    detailPageGroup.value = group;
  }
};
const onEntryClick = (entry: TimeEntry) => {
  //possible switch from group detail to entry detail, clear group detail
  detailPageGroup.value = null;

  detailPageEntry.value = entry;
};

const onFavoriteClicked = async (entry: TimeEntry) => {
  const task = tasksStore.get(entry.task_id);
  if (!task) {
    console.error("Task not found for entry:", entry);
    return;
  }

  favoriteTasksStore.toggle(task);
};
</script>
