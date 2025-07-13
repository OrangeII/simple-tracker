<template>
  <!-- page content -->
  <div class="p-4">
    <!-- chart title -->
    <input
      type="text"
      name="title"
      id="title"
      v-model="chartConfig.title"
      placeholder="Title"
      class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
    />

    <!-- chart description -->
    <input
      type="text"
      name="description"
      id="description"
      v-model="chartConfig.description"
      placeholder="Description"
      class="w-full focus:outline-none focus:border-none text-xl caret-primary"
    />

    <!-- period type selector -->
    <div class="mt-4">
      <label for="periodType">Period Type</label>
      <select id="periodType" v-model="chartConfig.periodType">
        <option :value="PeriodType.THIS_WEEK">This Week</option>
        <option :value="PeriodType.LAST_WEEK">Last Week</option>
        <option :value="PeriodType.THIS_MONTH">This Month</option>
        <option :value="PeriodType.LAST_MONTH">Last Month</option>
        <option :value="PeriodType.THIS_YEAR">This Year</option>
        <option :value="PeriodType.LAST_YEAR">Last Year</option>
      </select>
    </div>

    <!-- chart content -->
    <div class="flex flex-col">
      <div class="flex-grow">
        <Bar :data="chartData" :options="chartOptions"> </Bar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useStyleStore } from "../../stores/style";
import { getChartData } from "../../common/charts/charts";
import { PeriodType, type ChartConfig } from "../../common/charts/charts.types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);
const styleStore = useStyleStore();

const chartData = computed(() => {
  const data = getChartData(chartConfig.value);

  return {
    labels: data.points.x,
    datasets: data.points.ys.map((dataset) => ({
      ...dataset,
      borderColor: dataset.backgroundColor,
      borderWidth: 1,
    })),
  };
});

const chartConfig = ref<ChartConfig>({
  title: "",
  description: "",
  periodType: PeriodType.THIS_WEEK,
  groupBy: [],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "y-axis",
      },
      ticks: {
        color: styleStore.getPrimaryColor(),
      },
      grid: {
        color: styleStore.getPrimaryColor() + "40", // Add transparency
      },
    },
    x: {
      title: {
        display: true,
        text: "x-axis",
      },
      ticks: {
        color: styleStore.getPrimaryColor(),
      },
      grid: {
        color: styleStore.getPrimaryColor() + "40", // Add transparency
      },
    },
  },
};
</script>
