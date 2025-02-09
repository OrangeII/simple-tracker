<template>
  <div>
    <ul>
      <li v-for="entry in entries">
        <div>{{ entry.tasks.name }}</div>
        <div>{{ new Date(entry.start_time).toLocaleString() }}</div>
        <div>
          {{ entry.end_time ? new Date(entry.end_time).toLocaleString() : "" }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getEntries } from "../common/supabaseClient.ts";

const limit = 10;
const page = ref(0);
const loading = ref(false);
const hasMore = ref(true);
const entries = ref(null);

onMounted(async () => {
  entries.value = await getEntries(limit, page.value);
});
</script>
