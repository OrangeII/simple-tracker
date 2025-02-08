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
import { ref, defineEmits } from "vue";
import { supabase } from "../main.ts";

const taskName = ref("");
const altCode = ref("");
const loading = ref(false);
const message = ref("");

const emit = defineEmits(["taskCreated"]);

const startTracking = async () => {
  if (!taskName.value) {
    message.value = "Insert task name";
    return;
  }

  loading.value = true;
  message.value = "";

  //insert the new task
  let { data: createdTask, error } = await supabase
    .from("tasks")
    .insert({
      name: taskName.value,
      alt_code: altCode.value,
    })
    .select()
    .single();

  if (error) {
    message.value = error.message;
    loading.value = false;
    return;
  }

  //if the alt code was not provided, set it equal to the id
  if (!createdTask.alt_code) {
    const { data: updatedData } = await supabase
      .from("tasks")
      .update({ alt_code: createdTask.id })
      .eq("id", createdTask.id)
      .select()
      .single();
    createdTask = updatedData;
  }

  //emit the task created
  emit("taskCreated", createdTask);
  message.value = "Task started succesfully!";
  taskName.value = "";
  altCode.value = "";
  loading.value = false;
};
</script>
