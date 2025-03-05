<template>
  <AppPage title="Settings" @close="emit('close')">
    <template #main>
      <div class="flex gap-2 items-center" @click="signOut">
        <ArrowLeftStartOnRectangleIcon class="text-primary size-8" />
        <h3>Sign out</h3>
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

const emit = defineEmits<{
  close: [];
}>();
const userStore = useUserStore();

const signOut = async () => {
  await supabase.auth.signOut();
  userStore.user = null;
  emit("close");
};
</script>
