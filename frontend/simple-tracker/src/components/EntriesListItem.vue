<template>
  <EntriesListItemLayout
    :loading="entry.loading"
    @onResume="onResume"
    @onDelete="onDelete"
    @onFavoriteClick="onFavoriteClicked"
    :isFavorite="task?.is_favorite"
  >
    <template #left>
      <div class="flex-col">
        <h3 class="truncate">{{ task?.name }}</h3>
        <TagDots v-if="task" :task="task" />
      </div>
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
</template>

<script setup lang="ts">
import { toDurationString } from "../common/timeUtils";
import type { TimeEntry } from "../common/types";
import EntriesListItemLayout from "./EntriesListItemLayout.vue";
import TagDots from "./TagDots.vue";
import { useTasksStore } from "../stores/v2/tasks";
import { computed } from "vue";

const emit = defineEmits<{
  onResumeClicked: [entry: TimeEntry];
  onDeleteClicked: [entry: TimeEntry];
  onFavoriteClicked: [entry: TimeEntry];
}>();

const props = defineProps<{
  entry: TimeEntry;
}>();

const tasksStore = useTasksStore();
const task = computed(() => {
  return tasksStore.get(props.entry.task_id);
});

const onResume = () => {
  emit("onResumeClicked", props.entry);
};

const onDelete = () => {
  emit("onDeleteClicked", props.entry);
};

const onFavoriteClicked = () => {
  emit("onFavoriteClicked", props.entry);
};
</script>
