<template>
  <div class="p-4 flex flex-col gap-3">
    <!-- Time summary -->
    <div class="flex gap-3 flex-col md:flex-row">
      <div
        class="rounded-sm grainy bg-background dark:bg-blend-overlay p-4 flex-1"
      >
        <h4 class="text-text/70">Total tracked this week</h4>
        <h3>{{ stats.weekTotal }}</h3>
      </div>
      <div
        class="rounded-sm grainy bg-background dark:bg-blend-overlay p-4 flex-1"
      >
        <h4 class="text-text/70">Total tracked this month</h4>
        <h3>{{ stats.monthTotal }}</h3>
      </div>
      <div
        class="rounded-sm grainy bg-background dark:bg-blend-overlay p-4 flex-1"
      >
        <h4 class="text-text/70">Total tracked all time</h4>
        <h3>{{ stats.allTimeTotal }}</h3>
      </div>
    </div>

    <!-- Weekly time chart -->
    <div
      class="rounded-sm grainy bg-background dark:bg-blend-overlay p-4"
      v-if="!loadingWeeklyChart"
    >
      <h2 class="text-xl font-bold mb-2">Weekly Activity</h2>
      <WeeklyActivityChart :weekly-data="weeklyChartData" />
    </div>
    <div
      v-else
      class="animate-pulse h-64 rounded-sm grainy bg-background dark:bg-blend-overlay"
    ></div>

    <!-- Daily patterns chart -->
    <div
      class="rounded-sm grainy bg-background dark:bg-blend-overlay p-4"
      v-if="!loadingDailyChart"
    >
      <h2 class="text-xl font-bold mb-2">Daily Patterns</h2>
      <DailyPatternsChart :daily-data="dailyChartData" />
    </div>
    <div
      v-else
      class="animate-pulse h-64 rounded-sm grainy bg-background dark:bg-blend-overlay"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toDurationString } from "../common/timeUtils";
import { getTimeInsights } from "../common/supabaseClient";
import WeeklyActivityChart from "./charts/WeeklyActivityChart.vue";
import DailyPatternsChart from "./charts/DailyPatternsChart.vue";
import type {
  TimeInsightsDailyPatterns,
  TimeInsightsWeeklyActivity,
} from "../common/types";

// Stats for the summary cards
const stats = ref({
  weekTotal: "00:00:00",
  monthTotal: "00:00:00",
  allTimeTotal: "00:00:00",
});

// Charts data
const weeklyChartData = ref<Array<TimeInsightsWeeklyActivity>>([]);
const dailyChartData = ref<Array<TimeInsightsDailyPatterns>>([]);

// Loading states
const loadingWeeklyChart = ref(true);
const loadingDailyChart = ref(true);

onMounted(async () => {
  // Load the insights data
  const insights = await getTimeInsights();

  if (insights) {
    // Update summary stats
    stats.value = {
      weekTotal: toDurationString(new Date(insights.weekTotal)),
      monthTotal: toDurationString(new Date(insights.monthTotal)),
      allTimeTotal: toDurationString(new Date(insights.allTimeTotal)),
    };

    // Update chart data
    weeklyChartData.value = insights.weeklyActivity;
    dailyChartData.value = insights.dailyPatterns;

    // Set loading states to false
    loadingWeeklyChart.value = false;
    loadingDailyChart.value = false;
  }
});
</script>
