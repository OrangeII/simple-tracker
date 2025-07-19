<template>
  <Line :data="chartjsData" :options="barChartOptions"> </Line>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChartHelpersStore } from "../../stores/chartHelpers";
import type { ChartConfig, ChartData } from "../../common/charts/charts.types";
import { Line } from "vue-chartjs";
import { Chart as ChartJS, LineElement, PointElement } from "chart.js";
import { useStyleStore } from "../../stores/style";
ChartJS.register(LineElement, PointElement);

const props = defineProps<{
  chartConfig: ChartConfig;
  chartData: ChartData;
}>();

const chartHelpers = useChartHelpersStore();
const styleStore = useStyleStore();

const chartjsData = computed(() => {
  return {
    labels: props.chartData.points.x,
    datasets: props.chartData.points.ys.map((dataset) => ({
      ...dataset,
      borderColor: styleStore.getPrimaryColor(),
      borderWidth: 2,
      borderRadius: 2,
      lineTension: 0.4,
    })),
  };
});

const chartTooltipConfig = computed(() => {
  return chartHelpers.chartTooltipConfig(props.chartConfig);
});

const chartTicksConfigY = computed(() => {
  return chartHelpers.chartTicksConfigY(props.chartConfig);
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: chartTooltipConfig.value,
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: chartTicksConfigY.value,
      grid: {
        color: chartHelpers.chartGridColor,
      },
    },
    x: {
      ticks: {
        color: chartHelpers.chartTextColor,
      },
      grid: {
        color: chartHelpers.chartGridColor,
      },
    },
  },
};
</script>
