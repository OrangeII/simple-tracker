<template>
  <div>
    <Login v-if="!user" />
    <div v-else class="flex flex-col min-h-screen max-h-screen">
      <header class="p-4 border-wfdark border-b-1">
        <div class="flex flex-row items justify-between items-center">
          <h1>Hello, {{ user.user_metadata.preferred_username }}</h1>
          <input
            type="checkbox"
            class="w-5 h-5 accent-primary"
            v-model="groupItems"
          />
          <ArrowLeftStartOnRectangleIcon
            @click="signOut"
            class="text-primary size-8"
          />
        </div>
      </header>

      <main class="flex-1 px-4 overflow-auto">
        <EntriesList @taskResumed="onTaskResumed" :grouped="groupItems" />
      </main>

      <footer class="p-4 border-wfdark border-t-1">
        <StartTracking v-if="!currentTask" @taskStarted="onTaskstarted" />
        <CurrentTask
          v-else
          :task="currentTask"
          @trackingStopped="onTrackingStopped"
        />
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "./main.ts";
import Login from "./components/Login.vue";
import StartTracking from "./components/StartTracking.vue";
import CurrentTask from "./components/CurrentTask.vue";
import EntriesList from "./components/EntriesList.vue";
import { getCurrentTaskAndTimeEntry } from "./common/supabaseClient";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/vue/24/solid";

const user = ref(null);
const currentTask = ref(null);
const groupItems = ref(false);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  user.value = data?.session?.user || null;

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
    console.log(user.value);
    fetchCurrentTask();
  });
});

const fetchCurrentTask = async () => {
  if (!user.value) {
    currentTask.value = null;
    return;
  }
  const data = await getCurrentTaskAndTimeEntry();
  currentTask.value = data;
};

const signOut = async () => {
  await supabase.auth.signOut();
  user.value = null;
};

const onTaskstarted = async (task) => {
  currentTask.value = task;
};

const onTrackingStopped = async (task) => {
  currentTask.value = null;
};

const onTaskResumed = async (task) => {
  currentTask.value = task;
};
</script>
