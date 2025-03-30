<template>
  <!-- Entries list page -->
  <div
    v-if="navigationStore.isCurrentPage(NavigationPages.ENTRIES)"
    :key="NavigationPages.ENTRIES"
  >
    <Transition name="list-slide-left">
      <div v-if="favoriteTasksStore.favorites.length > 0">
        <FavoriteTasksList></FavoriteTasksList>
      </div>
    </Transition>
    <EntriesList
      :grouped="preferencesStore.preferences.displayEntriesGroupedById"
    />
  </div>

  <!-- Tags management page -->
  <div
    v-else-if="navigationStore.isCurrentPage(NavigationPages.TAGS)"
    :key="NavigationPages.TAGS"
  >
    <TagsManager />
  </div>

  <!-- insights dashboard page -->
  <div
    v-else-if="navigationStore.isCurrentPage(NavigationPages.DASHBOARD)"
    :key="NavigationPages.DASHBOARD"
  >
    <AppPageDashboard />
  </div>
</template>

<script setup lang="ts">
import { useNavigationStore, NavigationPages } from "../stores/navigation";
import FavoriteTasksList from "./FavoriteTasksList.vue";
import EntriesList from "./EntriesList.vue";
import TagsManager from "./TagsManager.vue";
import { usePreferencesStore } from "../stores/preferences";
import { useFavoriteTasksStore } from "../stores/favoriteTasks.ts";
import AppPageDashboard from "./AppPageDashboard.vue";

const preferencesStore = usePreferencesStore();
const favoriteTasksStore = useFavoriteTasksStore();
const navigationStore = useNavigationStore();
</script>
