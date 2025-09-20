<template>
  <!-- table -->
  <table class="w-full table-auto">
    <tbody
      v-for="(dateEntries, date) in timeLineStore.timeEntriesByDate"
      :key="date"
    >
      <tr class="font-bold uppercase">
        <td>{{ toEntriesDateString(new Date(date)) }}</td>
        <td>
          {{ toDurationString(new Date(dateEntries.totalTime)) }}
        </td>
      </tr>

      <tr
        v-if="!grouped"
        v-for="entry in dateEntries.entries"
        :key="entry.id"
      ></tr>
      <tr
        v-else
        v-for="group in dateEntries.entiresById"
        :key="group.id"
        @click="$emit('onGroupClick', group)"
      >
        <td>{{ tasks[group.id].name }}</td>
        <td>{{ toDurationString(new Date(group.totalTime)) }}</td>
        <td>
          <div class="flex flex-wrap gap-2 mb-2">
            <TaskTag
              v-for="tag in tasks[group.id].tags"
              :key="tag.id"
              :name="tag.name"
              :hex_color="tag.hex_color"
            />
          </div>
        </td>
        <td>
          <AppButtonDelete
            :hideCaption="true"
            @onDelete="$emit('onDeleteGroup', group)"
          />
        </td>
        <td>
          <AppButtonFavorite
            :hideCaption="true"
            :isFavorite="tasks[group.id]?.is_favorite"
            @onFavoriteClick="$emit('onFavoriteClicked', group.entries[0])"
          />
        </td>
        <td>
          <AppButtonResume @on-resume="$emit('onResume', group.entries[0])" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { useTimelineStore } from "../stores/timeline";
import { useTasksStore } from "../stores/tasks";
import { toEntriesDateString, toDurationString } from "../common/timeUtils";
import type { TimeEntry, TaskGroup, Task } from "../common/types";
import { computed } from "vue";
import TaskTag from "./TaskTag.vue";
import AppButtonFavorite from "./AppButtonFavorite.vue";
import AppButtonDelete from "./AppButtonDelete.vue";
import AppButtonResume from "./AppButtonResume.vue";

const timeLineStore = useTimelineStore();
const tasksStore = useTasksStore();

const tasks = computed<{
  [id: string]: Task;
}>(() => {
  return timeLineStore.timeEntries.reduce((ecc, entry) => {
    const task = tasksStore.get(entry.task_id);
    if (task) {
      ecc[task.id] = task;
    }
    return ecc;
  }, {} as { [id: string]: Task });
});

defineProps<{
  grouped: boolean;
}>();

defineEmits<{
  onResume: [TimeEntry];
  onDeleteEntry: [TimeEntry];
  onEntryClick: [TimeEntry];
  onFavoriteClicked: [TimeEntry];
  onDeleteGroup: [TaskGroup];
  onGroupClick: [TaskGroup];
}>();
</script>
