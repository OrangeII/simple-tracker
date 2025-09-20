<template>
  <div class="p-4 h-full flex flex-col">
    <!-- breadcrumbs ui -->
    <div class="flex gap-2 text-text/70 text-xl mb-4">
      <div
        class="cursor-pointer border-b-2 hover:border-primary"
        :class="{
          'border-primary': !selectedChart,
          'border-transparent': selectedChart,
        }"
        @click="selectedChart = null"
      >
        Charts
      </div>
      <template v-if="selectedChart">
        <div>/</div>
        <div class="border-b-2 border-primary">
          {{
            selectedChart.id
              ? selectedChart.chart_config.title || "untitled chart"
              : "new chart"
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          class="h-96 w-full rounded-sm border-4 border-dashed border-text/10 hover:border-primary/40 p-4 flex flex-col gap-4 justify-center items-center cursor-pointer text-text hover:text-primary"
          @click="addChart"
        >
          <ChartBarIcon class="size-10" />
          <h3>Add a new chart</h3>
        </div>
        <div
          class="cursor-pointer h-96 grainy dark:bg-blend-overlay rounded-sm border-1 border-text/10 hover:border-primary/40 p-4 flex flex-col gap-4"
          v-for="(chart, index) in chartsStore.chartConfigs"
          :key="index"
          @click="selectedChart = chart"
        >
          <h3>{{ chart.chart_config.title }}</h3>
          <AppChart
            class="grow"
            :chartData="
              getChartData(chart.chart_config, chartDataStore.rawChartData)
            "
            :chartConfig="chart.chart_config"
          >
          </AppChart>
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
import { getDefaultChartConfig } from "../../common/charts/charts.types";
import AppChart from "./AppChart.vue";
import { getChartData } from "../../common/charts/charts";
import { ChartBarIcon } from "@heroicons/vue/24/solid";

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
