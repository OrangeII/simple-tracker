<template>
  <AppPage
    :title="toDurationString(new Date(group.totalTime))"
    @close="emit('close')"
  >
    <template #actions>
      <div class="flex gap-1 items-center cursor-pointer" @click="onSaveClick">
        <CheckCircleIcon class="size-8 text-primary"></CheckCircleIcon>
        <h3 class="uppercase text-primary">save</h3>
      </div>
    </template>
    <template #main>
      <input
        required="true"
        type="text"
        v-model="taskName"
        class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary pb-4 px-4"
      />
      <div class="uppercase text-text/70 px-4 font-medium">
        {{ group.entries.length }}
        {{ group.entries.length > 1 ? "entries" : "entry" }} on
        {{ new Date(group.entries[0].start_time).toLocaleDateString() }}
      </div>
      <TransitionGroup name="list-slide-left">
        <EntriesListItemLayout
          v-for="entry in group.entries"
          :key="'group-page-item-' + entry.id"
          :entry="entry"
          :hide-play="true"
          :hide-favorite="true"
          class="px-4"
          @onClick="onEntryClick(entry)"
          @onDelete="onDeleteClick(entry)"
        >
          <template #left>
            <h3 class="truncate">{{ task?.name }}</h3>
          </template>
          <template v-if="entry.end_time" #duration>
            {{
              toDurationString(
                new Date(
                  new Date(entry.end_time).getTime() -
                    new Date(entry.start_time).getTime()
                )
              )
            }}
          </template>
        </EntriesListItemLayout>
      </TransitionGroup>
      <Transition :name="isDesktop ? 'list-slide-right' : 'page-slide'">
        <AppPageEntryDetail
          :anchor="isDesktop ? 'right' : ''"
          :widthClass="isDesktop ? 'w-96' : ''"
          :class="[isDesktop ? 'border-l border-text/10' : '']"
          v-if="detailPageEntry !== null"
          @close="detailPageEntry = null"
          :entry="detailPageEntry"
          >test</AppPageEntryDetail
        >
      </Transition>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from "./AppPage.vue";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import AppPageEntryDetail from "./AppPageEntryDetail.vue";
import { toDurationString } from "../common/timeUtils";
import type { TaskGroup, TimeEntry } from "../common/types";
import { computed, ref, watch } from "vue";
import { useTimeEntriesStore } from "../stores/timeEntries";
import { useTimelineStore } from "../stores/timeline";
import { useTasksStore } from "../stores/tasks";
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { useBreakpoints } from "../common/breakpoints";

const timeEntriesStore = useTimeEntriesStore();
const timeLineStore = useTimelineStore();
const tasksStore = useTasksStore();
const props = defineProps<{ group: TaskGroup }>();
const group = ref(props.group);
const task = computed(() => {
  return tasksStore.get(props.group.id);
});
const detailPageEntry = ref<TimeEntry | null>(null);
const taskName = ref(props.group.name || "");
const { isDesktop } = useBreakpoints();

const emit = defineEmits<{
  close: [];
}>();

watch(
  () => timeLineStore.timeEntriesByDate,
  (newValue) => {
    //find the group by id and update the group prop

    let dateGroup = newValue[props.group.date];

    if (dateGroup == undefined) {
      //this date group does not exist anymore
      emit("close");
      return;
    }

    let updatedGroup = dateGroup.entiresById[props.group.id];
    if (updatedGroup == undefined) {
      //this group is not in this date anymore
      emit("close");
      return;
    }

    group.value = updatedGroup;
    taskName.value = group.value.name;
  },
  { deep: true }
);

const onEntryClick = (entry: TimeEntry) => {
  detailPageEntry.value = entry;
};

const onDeleteClick = async (entry: TimeEntry) => {
  const c = confirm("Are you sure you want to delete this entry?");
  if (!c) return;

  //optimistically remove the entry
  timeEntriesStore.remove(entry);
};

const onSaveClick = async () => {
  if (group.value.entries.length == 0) {
    return;
  }

  if (!task.value) {
    return;
  }
  const newTask = { ...task.value, name: taskName.value };
  tasksStore.update(newTask);

  emit("close");
};
</script>
