<template>
  <AppPage title="Settings" @close="emit('close')">
    <template #main>
      <div class="p-4 flex flex-col gap-4">
        <div
          class="flex gap-4 items-center"
          @click="preferencesStore.toggle('darkMode')"
        >
          <div>
            <MoonIcon
              v-if="preferencesStore.preferences.darkMode"
              class="text-primary size-8"
            />
            <SunIcon v-else class="text-primary size-8" />
          </div>
          <h3>
            {{
              preferencesStore.preferences.darkMode
                ? "Dark theme"
                : "Light theme"
            }}
          </h3>
        </div>

        <div
          class="flex gap-4 items-center"
          @click="preferencesStore.toggle('displayEntriesGroupedById')"
        >
          <Square3Stack3DIcon
            class="text-primary size-8"
            :class="{
              'border-2 rounded-md p-1':
                preferencesStore.preferences.displayEntriesGroupedById,
            }"
          />
          <h3>
            {{
              preferencesStore.preferences.displayEntriesGroupedById
                ? "Show grouped entries"
                : "Show ungrouped entries"
            }}
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
