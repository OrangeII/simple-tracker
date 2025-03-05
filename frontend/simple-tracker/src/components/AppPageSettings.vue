<template>
  <AppPage title="Settings" @close="emit('close')">
    <template #main>
      <div class="flex flex-col gap-4">
        <div
          class="flex gap-4 items-center"
          @click="preferencesStore.toggleDarkMode"
        >
          <div>
            <MoonIcon
              v-if="preferencesStore.darkMode"
              class="text-primary size-8"
            />
            <SunIcon v-else class="text-primary size-8" />
          </div>
          <h3>
            {{ preferencesStore.darkMode ? "Dark theme" : "Light theme" }}
          </h3>
        </div>

        <div class="flex gap-4 items-center" @click="signOut">
          <ArrowLeftStartOnRectangleIcon class="text-primary size-8" />
          <h3>Sign out</h3>
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
} from "@heroicons/vue/24/solid";
import { useUserStore } from "../stores/user";
import { usePreferencesStore } from "../stores/preferences";

const emit = defineEmits<{
  close: [];
}>();
const userStore = useUserStore();
const preferencesStore = usePreferencesStore();

const signOut = async () => {
  await supabase.auth.signOut();
  userStore.user = null;
  emit("close");
};
</script>
