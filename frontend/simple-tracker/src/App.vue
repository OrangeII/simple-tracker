<template>
  <div>
    <Login v-if="!userStore.user" />
    <div v-else class="flex flex-col min-h-screen max-h-screen">
      <header class="p-4 border-wfdark border-b-1">
        <div class="flex flex-row items justify-between items-center">
          <h1>Hello, {{ userStore.user.user_metadata.preferred_username }}</h1>
          <div class="flex flex-row items-center">
            <Square3Stack3DIcon
              class="text-primary size-8 mr-4"
              :class="{
                'border-2 rounded-md p-1 size-9':
                  preferencesStore.preferences.displayEntriesGroupedById,
              }"
              @click="preferencesStore.toggleDisplayEntriesGroupedById"
            />
            <ArrowLeftStartOnRectangleIcon
              @click="signOut"
              class="text-primary size-8"
            />
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 overflow-auto">
        <EntriesList
          :grouped="preferencesStore.preferences.displayEntriesGroupedById"
        />
      </main>

      <footer class="p-4 border-wfdark border-t-1">
        <StartTracking v-if="!currentTaskStore.task" />
        <CurrentTask v-else />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { supabase } from "./main.ts";
import Login from "./components/Login.vue";
import StartTracking from "./components/StartTracking.vue";
import CurrentTask from "./components/CurrentTask.vue";
import EntriesList from "./components/EntriesList.vue";
import { getCurrentTaskAndTimeEntry } from "./common/supabaseClient";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/vue/24/solid";
import { Square3Stack3DIcon } from "@heroicons/vue/24/solid";
import { useUserStore } from "./stores/user";
import { useCurrentTaskStore } from "./stores/currentTask";
import { usePreferencesStore } from "./stores/preferences";

const userStore = useUserStore();
const currentTaskStore = useCurrentTaskStore();
const preferencesStore = usePreferencesStore();

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  userStore.user = data?.session?.user || null;

  supabase.auth.onAuthStateChange((_event, session) => {
    userStore.user = session?.user || null;
    fetchCurrentTask();
  });
});

const fetchCurrentTask = async () => {
  if (!userStore.user) {
    currentTaskStore.task = null;
    return;
  }
  const data = await getCurrentTaskAndTimeEntry();
  currentTaskStore.task = data;
};

const signOut = async () => {
  await supabase.auth.signOut();
  userStore.user = null;
};
</script>
