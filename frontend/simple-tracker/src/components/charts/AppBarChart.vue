<template>
  <Bar :data="chartjsData" :options="barChartOptions"> </Bar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChartHelpersStore } from "../../stores/chartHelpers";
import type { ChartConfig, ChartData } from "../../common/charts/charts.types";
import { Bar } from "vue-chartjs";
import { useStyleStore } from "../../stores/style";

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
      borderRadius: 2,
      borderColor: "black",
      borderWidth: 3,
      borderSkipped: false,
      backgroundColor: dataset.backgroundColor.map((color) => {
        if (!color) {
          return styleStore.getPrimaryColor();
        }
        return color;
      }),
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
