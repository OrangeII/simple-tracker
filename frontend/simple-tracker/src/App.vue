<template>
  <div
    class="bg-background text-text"
    :class="[preferencesStore.preferences.darkMode ? 'dark' : '']"
  >
    <Login v-if="!userStore.user" />
    <div v-else :class="{ 'lg:flex lg:flex-row': isDesktop }">
      <!-- Sidebar for desktop -->
      <div
        v-if="isDesktop"
        class="w-fit h-screen border-r border-text/10 flex flex-col"
      >
        <Toolbar @settings-click="showSettingsPage = true"></Toolbar>
      </div>

      <div class="flex-1 flex flex-col min-h-screen max-h-screen">
        <header
          v-if="isMobile"
          class="p-4 transition-[margin] ease-linear duration-300"
        >
          <Toolbar @settings-click="showSettingsPage = true" />
        </header>

        <main class="flex-1 overflow-auto" @scroll="handleScroll">
          <Transition name="list-slide-left">
            <div v-if="favoriteTasksStore.favorites.length > 0">
              <FavoriteTasksList></FavoriteTasksList>
            </div>
          </Transition>
          <EntriesList
            :grouped="preferencesStore.preferences.displayEntriesGroupedById"
          />
        </main>

        <footer class="p-4">
          <StartTracking v-if="!currentTaskStore.task" />
          <CurrentTask v-else />
        </footer>
      </div>

      <Transition :name="isDesktop ? 'list-slide-left' : 'page-slide'">
        <AppPageSettings
          :class="[isDesktop ? 'w-96 border-r border-text/10' : '']"
          v-if="showSettingsPage"
          @close="showSettingsPage = false"
        ></AppPageSettings>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { supabase } from "./main.ts";
import type { Subscription } from "@supabase/supabase-js";
import Login from "./components/Login.vue";
import StartTracking from "./components/StartTracking.vue";
import CurrentTask from "./components/CurrentTask.vue";
import EntriesList from "./components/EntriesList.vue";
import { useUserStore } from "./stores/user";
import { useCurrentTaskStore } from "./stores/currentTask";
import { usePreferencesStore } from "./stores/preferences";
import Toolbar from "./components/Toolbar.vue";
import AppPageSettings from "./components/AppPageSettings.vue";
import { useFavoriteTasksStore } from "./stores/favoriteTasks.ts";
import FavoriteTasksList from "./components/FavoriteTasksList.vue";
import { useBreakpoints } from "./common/breakpoints.ts";

const userStore = useUserStore();
const currentTaskStore = useCurrentTaskStore();
const favoriteTasksStore = useFavoriteTasksStore();
const preferencesStore = usePreferencesStore();
const showSettingsPage = ref(false);
const { isMobile, isDesktop } = useBreakpoints();
let authStateChangeSub: Subscription | null = null;

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  userStore.user = data?.session?.user || null;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    userStore.user = session?.user || null;
    currentTaskStore.fetchCurrentTask();
    currentTaskStore.initializeSubscriptionToCurrentTask();

    favoriteTasksStore.fetchFavorites();
  });
  authStateChangeSub = subscription;
});

onUnmounted(() => {
  currentTaskStore.cleanup();
  authStateChangeSub?.unsubscribe();
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
