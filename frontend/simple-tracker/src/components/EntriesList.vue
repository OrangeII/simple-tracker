<template>
  <div>
    <div>
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="border-wfdark border-1 rounded-sm p-2 my-3 flex flex-row justify-between"
      >
        <div class="flex-grow max-w-[65%]">
          <h3 class="truncate">{{ entry.tasks.name }}</h3>
          <p>{{ new Date(entry.start_time).toLocaleDateString() }}</p>
        </div>
        <div>
          <div>
            {{
              entry.end_time
                ? toTimeString(
                    new Date(entry.end_time) - new Date(entry.start_time)
                  )
                : "ongoing"
            }}
          </div>
          <button v-if="entry.end_time" @click="onResume(entry.tasks.id)">
            resume
          </button>
        </div>
      </div>
    </div>

    <!-- Scroll Trigger (Empty div at bottom for IntersectionObserver) -->
    <div id="scroll-trigger" class="h-10"></div>

    <!-- Loading Indicator -->
    <p v-if="loading" class="text-center mt-4">loading...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getEntries } from "../common/supabaseClient.ts";
import { toTimeString } from "../common/timeUtils.ts";

const limit = 10;
const page = ref(0);
const loading = ref(false);
const entries = ref([]);
const observer = ref(null);

onMounted(async () => {
  fetchEntries();
  observer.value = new IntersectionObserver(observerCallBack, {
    rootMargin: "100px",
  });

  const sentinel = document.getElementById("scroll-trigger");
  if (sentinel) observer.value.observe(sentinel);
});

const fetchEntries = async () => {
  if (loading.value) return;
  loading.value = true;

  const newEntries = await getEntries(limit, page.value);
  if (!newEntries || newEntries.length == 0) {
    loading.value = false;
    return;
  }

  entries.value.push(...newEntries);
  page.value++;
  loading.value = false;
};

const observerCallBack = (entries) => {
  if (entries[0].isIntersecting) {
    fetchEntries();
  }
};

const onResume = (taskId) => {
  console.log("resume", taskId);
};
</script>
