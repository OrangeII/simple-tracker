<template>
  <div>
    <Login v-if="!userStore.user" />
    <div v-else class="flex flex-col min-h-screen max-h-screen">
      <header class="p-4">
        <Toolbar />
      </header>

      <main class="flex-1 px-4 overflow-auto">
        <EntriesList
          :grouped="preferencesStore.preferences.displayEntriesGroupedById"
        />
      </main>

      <footer class="p-4">
        <StartTracking v-if="!currentTaskStore.task" />
        <CurrentTask v-else />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { supabase } from "./main.ts";
import Login from "./components/Login.vue";
import StartTracking from "./components/StartTracking.vue";
import CurrentTask from "./components/CurrentTask.vue";
import EntriesList from "./components/EntriesList.vue";
import { useUserStore } from "./stores/user";
import { useCurrentTaskStore } from "./stores/currentTask";
import { usePreferencesStore } from "./stores/preferences";
import Toolbar from "./components/Toolbar.vue";

const userStore = useUserStore();
const currentTaskStore = useCurrentTaskStore();
const preferencesStore = usePreferencesStore();

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  userStore.user = data?.session?.user || null;

  supabase.auth.onAuthStateChange((_event, session) => {
    userStore.user = session?.user || null;
    currentTaskStore.fetchCurrentTask();
    currentTaskStore.initializeSubscriptionToCurrentTask();
  });
});

onUnmounted(() => {
  currentTaskStore.cleanup();
});
</script>
