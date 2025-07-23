<template>
  <div
    v-if="chartData.points.x.length > 0"
    class="grainy bg-background dark:bg-blend-overlay"
  >
    <AppBarChart
      v-if="chartConfig.chartType === ChartType.BAR"
      :chartConfig="chartConfig"
      :chartData="chartData"
    ></AppBarChart>
    <AppDoughnutChart
      v-else-if="chartConfig.chartType === ChartType.DOUGHNUT"
      :chartConfig="chartConfig"
      :chartData="chartData"
    >
    </AppDoughnutChart>
    <AppLineChart
      v-else-if="chartConfig.chartType === ChartType.LINE"
      :chartConfig="chartConfig"
      :chartData="chartData"
    ></AppLineChart>
  </div>
  <div
    v-else
    class="grainy bg-background dark:bg-blend-overlay p-4 flex items-center justify-center h-full"
  >
    <p class="text-text/70">
      No data available for the selected configuration.
    </p>
  </div>
</template>
<script setup lang="ts">
import type { ChartConfig, ChartData } from "../../common/charts/charts.types";
import { ChartType } from "../../common/charts/charts.types";
import AppBarChart from "./AppBarChart.vue";
import AppDoughnutChart from "./AppDoughnutChart.vue";
import AppLineChart from "./AppLineChart.vue";

defineProps<{
  chartConfig: ChartConfig;
  chartData: ChartData;
}>();
</script>
