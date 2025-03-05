<template>
  <div class="flex flex-row items justify-between items-center">
    <h1>
      Hello, {{ userStore.user?.user_metadata.preferred_username || "👽" }}
    </h1>
    <div class="flex flex-row items-center gap-4">
      <div v-if="preferencesStore.darkModeToolbar" id="themeToggle">
        <MoonIcon
          class="text-primary size-8"
          v-if="preferencesStore.darkMode"
          @click="preferencesStore.toggleDarkMode"
        />
        <SunIcon
          class="text-primary size-8"
          v-else
          @click="preferencesStore.toggleDarkMode"
        />
      </div>

      <Square3Stack3DIcon
        v-if="preferencesStore.displayEntriesGroupedByIdToolbar"
        class="text-primary size-8"
        :class="{
          'border-2 rounded-md p-1': preferencesStore.displayEntriesGroupedById,
        }"
        @click="preferencesStore.toggleDisplayEntriesGroupedById"
      />

      <Cog8ToothIcon
        class="text-primary size-8"
        @click="$emit('settingsClick')"
      ></Cog8ToothIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supabase } from "../main";
import { usePreferencesStore } from "../stores/preferences";
import { useUserStore } from "../stores/user";
import {
  Square3Stack3DIcon,
  MoonIcon,
  SunIcon,
  Cog8ToothIcon,
} from "@heroicons/vue/24/solid";

defineEmits<{
  settingsClick: [];
}>();
const userStore = useUserStore();
const preferencesStore = usePreferencesStore();
</script>
