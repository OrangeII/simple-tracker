<template>
  <div
    :class="[
      isMobile
        ? 'flex flex-row items-start justify-between pt-4 border-b border-text/10'
        : 'flex flex-col w-16 items-center gap-4 pt-4',
    ]"
  >
    <div v-if="preferencesStore.preferences.darkModeToolbar" id="themeToggle">
      <MoonIcon
        class="text-primary size-8"
        v-if="preferencesStore.preferences.darkMode"
        @click="preferencesStore.toggle('darkMode')"
      />
      <SunIcon
        class="text-primary size-8"
        v-else
        @click="preferencesStore.toggle('darkMode')"
      />
    </div>

    <Square3Stack3DIcon
      v-if="preferencesStore.preferences.displayEntriesGroupedByIdToolbar"
      class="text-primary size-8"
      :class="{
        'border-2 rounded-md p-1':
          preferencesStore.preferences.displayEntriesGroupedById,
      }"
      @click="preferencesStore.toggle('displayEntriesGroupedById')"
    />

    <ToolbarNavigationButton
      :icon="HomeIcon"
      :is-active="navigationStore.isCurrentPage(NavigationPages.ENTRIES)"
      @click="navigationStore.navigateTo(NavigationPages.ENTRIES)"
    />

    <ToolbarNavigationButton
      :icon="TagIcon"
      :is-active="navigationStore.isCurrentPage(NavigationPages.TAGS)"
      @click="navigationStore.navigateTo(NavigationPages.TAGS)"
    />

    <ToolbarNavigationButton
      :icon="ChartBarIcon"
      :is-active="navigationStore.isCurrentPage(NavigationPages.DASHBOARD)"
      @click="navigationStore.navigateTo(NavigationPages.DASHBOARD)"
    />

    <Cog8ToothIcon
      class="text-primary size-8 cursor-pointer grow"
      @click="$emit('settingsClick')"
    ></Cog8ToothIcon>
  </div>
</template>

<script setup lang="ts">
import { usePreferencesStore } from "../stores/preferences";
import {
  Square3Stack3DIcon,
  MoonIcon,
  SunIcon,
  Cog8ToothIcon,
  HomeIcon,
  TagIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/solid";
import { useBreakpoints } from "../common/breakpoints";
import { useNavigationStore, NavigationPages } from "../stores/navigation";
import ToolbarNavigationButton from "./ToolbarNavigationButton.vue";

const navigationStore = useNavigationStore();
const { isMobile } = useBreakpoints();

defineEmits<{
  settingsClick: [];
}>();
const preferencesStore = usePreferencesStore();
</script>
