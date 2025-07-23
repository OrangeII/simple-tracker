<template>
  <Line :data="chartjsData" :options="chartOptions"> </Line>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChartHelpersStore } from "../../stores/chartHelpers";
import type { ChartConfig, ChartData } from "../../common/charts/charts.types";
import { Line } from "vue-chartjs";
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
      borderColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          // This case happens on initial chart load
          return;
        }

        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        );
        gradient.addColorStop(0, styleStore.getPrimaryColor());
        gradient.addColorStop(1, styleStore.getPrimaryColor() + "40");
        return gradient;
      },
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          // This case happens on initial chart load
          return;
        }

        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        );
        gradient.addColorStop(0, styleStore.getPrimaryColor() + "80");
        gradient.addColorStop(1, styleStore.getPrimaryColor() + "00");
        return gradient;
      },
      borderWidth: 3,
      lineTension: 0.4,
      fill: true,
    })),
  };
});

const chartTooltipConfig = computed(() => {
  return chartHelpers.chartTooltipConfig(props.chartConfig);
});

const chartTicksConfigY = computed(() => {
  return chartHelpers.chartTicksConfigY(props.chartConfig);
});

const chartTicksConfigX = computed(() => {
  return chartHelpers.chartTicksConfigX(props.chartConfig);
});

const chartOptions = computed(() => {
  return {
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
        ticks: chartTicksConfigX.value,
        grid: {
          color: chartHelpers.chartGridColor,
        },
      },
    },
  };
});
</script>
