<template>
  <AppPage
    :title="toDurationString(new Date(group.totalTime))"
    @close="emit('close')"
  >
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
      <EntriesListItemLayout
        v-for="entry in group.entries"
        :key="entry.id"
        :entry="entry"
        :hide-play="true"
        class="px-4"
        @onClick="onEntryClick(entry)"
      >
        <template #left>
          <h3 class="truncate">{{ entry.tasks?.name }}</h3>
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

      <Transition name="page-slide">
        <AppPageEntryDetail
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
import { ref } from "vue";

const detailPageEntry = ref<TimeEntry | null>(null);

const props = defineProps<{ group: TaskGroup }>();

const taskName = ref(props.group.name || "");

const emit = defineEmits<{
  close: [];
}>();

const onEntryClick = (entry: TimeEntry) => {
  detailPageEntry.value = entry;
  console.log(detailPageEntry.value);
};
</script>
