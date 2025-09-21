<template>
  <!-- table -->
  <div class="px-4 pt-6">
    <table class="table table-auto w-full">
      <tbody
        v-for="(dateEntries, date) in timeLineStore.timeEntriesByDate"
        :key="date"
        class="pb-12"
      >
        <tr class="header font-bold uppercase">
          <td>{{ toEntriesDateString(new Date(date)) }}</td>
          <td>
            {{ toDurationString(new Date(dateEntries.totalTime)) }}
          </td>
        </tr>
        <tr
          v-for="rowData in rowsData[date]"
          :key="rowData.id"
          @click="
            rowData.isGrouped && rowData.group
              ? $emit('onGroupClick', rowData.group)
              : $emit('onEntryClick', rowData.entry)
          "
        >
          <td>{{ tasks[rowData.id].name }}</td>
          <td>
            {{ rowData.durationString }}
          </td>
          <td>
            <div class="flex flex-wrap gap-2">
              <TaskTag
                v-for="tag in tasks[rowData.id].tags"
                :key="tag.id"
                :name="tag.name"
                :hex_color="tag.hex_color"
              />
            </div>
          </td>
          <td>
            <div class="flex flex-row gap-2">
              <AppButtonDelete
                :hideCaption="true"
                @onDelete="
                  rowData.isGrouped && rowData.group
                    ? $emit('onDeleteGroup', rowData.group)
                    : $emit('onDeleteEntry', rowData.entry)
                "
              />
              <AppButtonFavorite
                :hideCaption="true"
                :isFavorite="tasks[rowData.id]?.is_favorite"
                @onFavoriteClick="$emit('onFavoriteClicked', rowData.entry)"
              />
              <AppButtonResume
                :suppress-flex-end="true"
                @on-resume="$emit('onResume', rowData.entry)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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

interface RowData {
  id: string;
  isGrouped: boolean;
  group: TaskGroup | null;
  entry: TimeEntry;
  durationString: string;
}
const rowsData = computed<{
  [date: string]: RowData[];
}>(() => {
  const acc = {} as { [date: string]: RowData[] };
  for (const [date, dateEntries] of Object.entries(
    timeLineStore.timeEntriesByDate
  )) {
    acc[date] = [];
    if (!dateEntries) continue;

    if (props.grouped) {
      for (const [groupId, group] of Object.entries(dateEntries.entiresById)) {
        acc[date].push({
          id: groupId,
          isGrouped: true,
          group,
          entry: group.entries[0],
          durationString: toDurationString(new Date(group.totalTime)),
        });
      }
    } else {
      for (const entry of dateEntries.entries) {
        acc[date].push({
          id: entry.task_id,
          isGrouped: false,
          group: null,
          entry,
          durationString: entry.end_time
            ? toDurationString(
                new Date(
                  new Date(entry.end_time).getTime() -
                    new Date(entry.start_time).getTime()
                )
              )
            : "ongoing",
        });
      }
    }
  }
  return acc;
});

const tasks = computed<{
  [id: string]: Task;
}>(() => {
  return timeLineStore.timeEntries.reduce((acc, entry) => {
    const task = tasksStore.get(entry.task_id);
    if (task) {
      acc[task.id] = task;
    }
    return acc;
  }, {} as { [id: string]: Task });
});

const props = defineProps<{
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
