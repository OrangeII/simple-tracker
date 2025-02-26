<template>
  <div class="flex flex-row items justify-between items-center">
    <h1>
      Hello, {{ userStore.user?.user_metadata.preferred_username || "👽" }}
    </h1>
    <div class="flex flex-row items-center">
      <Square3Stack3DIcon
        class="text-primary size-8 mr-4"
        :class="{
          'border-2 rounded-md p-1 size-9':
            preferencesStore.displayEntriesGroupedById,
        }"
        @click="preferencesStore.toggleDisplayEntriesGroupedById"
      />
      <ArrowLeftStartOnRectangleIcon
        @click="signOut"
        class="text-primary size-8"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { supabase } from "../main";
import { usePreferencesStore } from "../stores/preferences";
import { useUserStore } from "../stores/user";
import {
  Square3Stack3DIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/vue/24/solid";

const userStore = useUserStore();
const preferencesStore = usePreferencesStore();

const signOut = async () => {
  await supabase.auth.signOut();
  userStore.user = null;
};
</script>
