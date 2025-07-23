<template>
  <div class="p-4 h-full flex flex-col">
    <!-- breadcrumbs ui -->
    <div class="flex gap-2 text-text/70 text-xl pb-4">
      <div
        class="cursor-pointer border-b-2 border-transparent hover:border-primary"
        @click="selectedChart = null"
      >
        Charts
      </div>
      <template v-if="selectedChart">
        <div>/</div>
        <div>
          {{
            selectedChart.id ? selectedChart.chart_config.title : "new chart"
          }}
        </div>
      </template>
    </div>

    <!-- chart edit form -->
    <AppEditChart
      v-if="selectedChart"
      :chartConfigRecord="selectedChart"
      @close="selectedChart = null"
      class="flex-1"
    />
    <!-- charts list -->
    <div v-else>
      <AppButton @click="addChart">Add Chart</AppButton>
      <div class="flex flex-col gap-2">
        <div
          v-for="(chart, index) in chartsStore.chartConfigs"
          :key="index"
          @click="selectedChart = chart"
          class="cursor-pointer"
        >
          {{ chart.chart_config.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useChartsStore } from "../../stores/charts";
import type { ChartConfigRecord } from "../../common/charts/charts.supabase";
import { useChartDataStore } from "../../stores/chartData";
import AppEditChart from "./AppEditChart.vue";
import AppButton from "../AppButton.vue";
import { getDefaultChartConfig } from "../../common/charts/charts.types";

const chartsStore = useChartsStore();
const chartDataStore = useChartDataStore();
const selectedChart = ref<ChartConfigRecord | null>(null);

onMounted(async () => {
  await Promise.all([
    chartsStore.fetchConfigs(),
    chartDataStore.refreshChartData(),
  ]);
});

const addChart = () => {
  selectedChart.value = {
    id: "",
    user_id: "",
    created_at: new Date().toISOString(),
    chart_config: getDefaultChartConfig(),
  };
};
</script>
