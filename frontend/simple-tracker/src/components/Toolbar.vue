<template>
  <div class="flex flex-row items justify-between items-center">
    <h1>
      Hello, {{ userStore.user?.user_metadata.preferred_username || "👽" }}
    </h1>
    <div class="flex flex-row items-center gap-4">
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

      <Cog8ToothIcon
        class="text-primary size-8"
        @click="$emit('settingsClick')"
      ></Cog8ToothIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
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
