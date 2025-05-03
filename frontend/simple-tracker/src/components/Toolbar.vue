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

    <div class="flex flex-col items-center gap-1 grow">
      <HomeIcon
        class="text-primary size-8 cursor-pointer"
        @click="navigationStore.navigateTo(NavigationPages.ENTRIES)"
      ></HomeIcon>
      <div
        v-if="navigationStore.isCurrentPage(NavigationPages.ENTRIES)"
        class="w-full h-[2px] bg-primary"
        :class="[isMobile ? 'mt-2' : '']"
      ></div>
    </div>

    <div class="flex flex-col items-center gap-1 grow">
      <TagIcon
        class="text-primary size-8 cursor-pointer"
        @click="navigationStore.navigateTo(NavigationPages.TAGS)"
      ></TagIcon>
      <div
        v-if="navigationStore.isCurrentPage(NavigationPages.TAGS)"
        class="w-full h-[2px] bg-primary"
        :class="[isMobile ? 'mt-2' : '']"
      ></div>
    </div>

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
} from "@heroicons/vue/24/solid";
import { useBreakpoints } from "../common/breakpoints";
import { useNavigationStore, NavigationPages } from "../stores/navigation";

const navigationStore = useNavigationStore();
const { isMobile } = useBreakpoints();

defineEmits<{
  settingsClick: [];
}>();
const preferencesStore = usePreferencesStore();
</script>
