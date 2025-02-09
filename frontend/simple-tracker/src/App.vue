<template>
  <div>
    <Login v-if="!user" />
    <div v-else class="flex flex-col min-h-screen max-h-screen">
      <header class="p-4 border-wfdark border-b-1">
        <h1>Welcome, {{ user.email }}</h1>
        <button @click="signOut">Sign Out</button>
      </header>

      <main class="flex-1 px-4 overflow-auto"><EntriesList /></main>

      <footer class="p-4 border-wfdark border-t-1">
        <StartTracking v-if="!currentTask" @taskCreated="onTaskCreated" />
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

const user = ref(null);
const currentTask = ref(null);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  user.value = data?.session?.user || null;

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
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

const onTaskCreated = async (task) => {
  currentTask.value = task;
};

const onTrackingStopped = async (task) => {
  currentTask.value = null;
};
</script>
