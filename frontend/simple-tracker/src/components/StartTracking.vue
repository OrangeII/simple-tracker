<template>
  <div>
    <h2>Start tracking</h2>

    <input type="text" v-model="taskName" placeholder="Task name" />
    <input type="text" v-model="altCode" placeholder="alt code" />
    <button @click="startTracking">
      {{ loading ? "Starting..." : "Start Tracking" }}
    </button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../main.ts";

const taskName = ref("");
const altCode = ref("");
const loading = ref(false);
const message = ref("");

const startTracking = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  loading.value = true;
  message.value = "";

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      name: taskName.value,
      alt_code: altCode.value,
    })
    .select();

  if (error) {
    message.value = error.message;
  } else {
    message.value = "Task started succesfully!";
    taskName.value = "";
    altCode.value = "";
  }

  loading.value = false;

  console.log(data);
};
</script>
