<template>
  <Doughnut :data="chartjsData" :options="barChartOptions"> </Doughnut>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChartHelpersStore } from "../../stores/chartHelpers";
import type { ChartConfig, ChartData } from "../../common/charts/charts.types";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement } from "chart.js";
ChartJS.register(ArcElement);

const props = defineProps<{
  chartConfig: ChartConfig;
  chartData: ChartData;
}>();

const chartHelpers = useChartHelpersStore();

const chartjsData = computed(() => {
  return {
    labels: props.chartData.points.x,
    datasets: props.chartData.points.ys.map((dataset) => ({
      ...dataset,
      borderColor: dataset.backgroundColor,
      borderWidth: 2,
      borderRadius: 2,
      lineTension: 0.4,
    })),
  };
});

const chartTooltipConfig = computed(() => {
  return chartHelpers.chartTooltipConfig(props.chartConfig);
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: chartTooltipConfig.value,
  },
};
</script>
