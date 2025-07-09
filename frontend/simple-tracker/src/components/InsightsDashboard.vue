<template>
  <div class="p-4 flex flex-col gap-3">
    <!-- Time summary -->
    <div class="flex gap-3 flex-wrap">
      <AppInsightsTopTasksCard
        class="min-w-70"
        :time-total="stats.weekTotal"
        :top-tasks="stats.topWeeklyTasks"
        title="This week"
        :loading="loading"
      />
      <AppInsightsTopTasksCard
        class="min-w-70"
        :time-total="stats.monthTotal"
        :top-tasks="stats.topMonthlyTasks"
        title="This month"
        :loading="loading"
      />
      <AppInsightsTopTasksCard
        class="min-w-70"
        :time-total="stats.allTimeTotal"
        :top-tasks="stats.topAllTimeTasks"
        title="All time"
        :loading="loading"
      />
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

    <!-- Daily patterns chart - Conditionally displayed based on feature flag -->
    <template v-if="featureFlagsStore.showDailyPatterns">
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
    </template>
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
  TaskTimeInfo,
} from "../common/types";
import AppInsightsTopTasksCard from "./AppInsightsTopTasksCard.vue";
import { useFeatureFlagsStore } from "../stores/featureFlags";

const featureFlagsStore = useFeatureFlagsStore();

// Stats for the summary cards
const stats = ref<{
  weekTotal: string;
  monthTotal: string;
  allTimeTotal: string;
  topWeeklyTasks: Array<TaskTimeInfo>;
  topMonthlyTasks: Array<TaskTimeInfo>;
  topAllTimeTasks: Array<TaskTimeInfo>;
}>({
  weekTotal: "00:00:00",
  monthTotal: "00:00:00",
  allTimeTotal: "00:00:00",
  topWeeklyTasks: [],
  topMonthlyTasks: [],
  topAllTimeTasks: [],
});

// Charts data
const weeklyChartData = ref<Array<TimeInsightsWeeklyActivity>>([]);
const dailyChartData = ref<Array<TimeInsightsDailyPatterns>>([]);

// Loading states
const loadingWeeklyChart = ref(true);
const loadingDailyChart = ref(true);
const loading = ref(true);

onMounted(async () => {
  // Load the insights data
  const insights = await getTimeInsights();

  if (insights) {
    // Update summary stats
    stats.value = {
      weekTotal: toDurationString(new Date(insights.weekTotal)),
      monthTotal: toDurationString(new Date(insights.monthTotal)),
      allTimeTotal: toDurationString(new Date(insights.allTimeTotal)),
      topWeeklyTasks: insights.topWeeklyTasks,
      topMonthlyTasks: insights.topMonthlyTasks,
      topAllTimeTasks: insights.topAllTimeTasks,
    };

    // Update chart data
    weeklyChartData.value = insights.weeklyActivity;
    dailyChartData.value = insights.dailyPatterns;

    // Set loading states to false
    loadingWeeklyChart.value = false;
    loadingDailyChart.value = false;
    loading.value = false;
  }
});
</script>
