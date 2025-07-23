<template>
  <AppPage
    :title="`Hello, ${
      userStore.user?.user_metadata.preferred_username || '👽'
    }`"
    @close="emit('close')"
  >
    <template #main>
      <div class="p-4 flex flex-col gap-4">
        <div
          class="flex gap-4 items-center cursor-pointer"
          @click="preferencesStore.toggle('darkMode')"
        >
          <div>
            <MoonIcon
              v-if="preferencesStore.preferences.darkMode"
              class="text-primary size-8"
            />
            <SunIcon v-else class="text-primary size-8" />
          </div>
          <h3>
            {{
              preferencesStore.preferences.darkMode
                ? "Dark theme"
                : "Light theme"
            }}
          </h3>
        </div>

        <div
          class="flex gap-4 items-center cursor-pointer"
          @click="preferencesStore.toggle('displayEntriesGroupedById')"
        >
          <Square3Stack3DIcon
            class="text-primary size-8"
            :class="{
              'border-2 rounded-md p-1':
                preferencesStore.preferences.displayEntriesGroupedById,
            }"
          />
          <h3>
            {{
              preferencesStore.preferences.displayEntriesGroupedById
                ? "Show grouped entries"
                : "Show ungrouped entries"
            }}
          </h3>
        </div>

        <!-- show or hide individual task stats -->
        <div
          class="flex gap-4 items-center cursor-pointer"
          @click="preferencesStore.toggle('diplayTaskStats')"
        >
          <ChartBarIcon
            class="text-primary size-8"
            :class="{
              'border-2 rounded-md p-1':
                preferencesStore.preferences.diplayTaskStats,
            }"
          />
          <h3>
            {{
              preferencesStore.preferences.diplayTaskStats
                ? "Show task stats"
                : "Hide task stats"
            }}
          </h3>
        </div>

        <div class="flex gap-4 items-center cursor-pointer" @click="signOut">
          <ArrowLeftStartOnRectangleIcon class="text-primary size-8" />
          <h3>Sign out</h3>
        </div>
      </div>

      <!-- credits -->
      <div
        class="fixed bottom-0 left-0 text-text/70 text-xs p-4 flex justify-between items-center"
      >
        <div class="flex-1">
          made on wednesdays by
          <a
            class="text-primary hover:underline"
            href="https://github.com/OrangeII"
          >
            OrangeII
          </a>
        </div>
      </div>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from "./AppPage.vue";
import { supabase } from "../main";
import {
  Square3Stack3DIcon,
  ArrowLeftStartOnRectangleIcon,
  MoonIcon,
  SunIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/solid";
import { useUserStore } from "../stores/user";
import { usePreferencesStore } from "../stores/preferences";
import { useTimeEntriesStore } from "../stores/timeEntries";
import { useFavoriteTasksStore } from "../stores/favoriteTasks";
import { useTasksStore } from "../stores/tasks";

const emit = defineEmits<{
  close: [];
}>();
const userStore = useUserStore();
const preferencesStore = usePreferencesStore();
const timeEntriesStore = useTimeEntriesStore();
const tasksStore = useTasksStore();
const favoriteTasksStore = useFavoriteTasksStore();

const signOut = async () => {
  await supabase.auth.signOut();
  userStore.user = null;
  timeEntriesStore.timeEntries = [];
  tasksStore.tasks = [];
  favoriteTasksStore.clear();
  emit("close");
};
</script>
