<template>
  <div>
    <Login v-if="!user" />
    <div v-else>
      <div>
        <h1>Welcome, {{ user.email }}</h1>
        <button @click="helloWorld">Hello word</button>
        <button @click="signOut">Sign Out</button>
      </div>

      <StartTracking @taskCreated="onTaskCreated" />

      <CurrentTask :task="currentTask" @trackingStopped="onTrackingStopped" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "./main.ts";
import Login from "./components/Login.vue";
import StartTracking from "./components/StartTracking.vue";
import CurrentTask from "./components/CurrentTask.vue";
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

const helloWorld = async () => {
  try {
    const response = await supabase.functions.invoke("hello-world", {
      body: { name: user.value.email },
    });
  } catch (error) {
    console.error("Error calling function:", error);
  }
};
</script>
