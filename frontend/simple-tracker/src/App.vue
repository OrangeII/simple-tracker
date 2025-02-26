<template>
  <div>
    <Login v-if="!userStore.user" />
    <div v-else class="flex flex-col min-h-screen max-h-screen">
      <header
        class="p-4 transition-[margin] ease-linear duration-300"
        :class="[isScrollingDown ? 'md:mt-0 -mt-18' : 'mt-0']"
      >
        <Toolbar />
      </header>

      <main class="flex-1 px-4 overflow-auto" @scroll="handleScroll">
        <EntriesList :grouped="preferencesStore.displayEntriesGroupedById" />
      </main>

      <footer class="p-4">
        <StartTracking v-if="!currentTaskStore.task" />
        <CurrentTask v-else />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
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

/**
 * Handle the scroll event to conditionally hide the toolbar
 */
const isScrollingDown = ref(false);
let lastScrollTop = 0;
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 0) {
    isScrollingDown.value = true;
  } else {
    isScrollingDown.value = false;
  }

  lastScrollTop = scrollTop;
};
</script>
