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

    <!-- chart type selector -->
    <div class="mt-4">
      <label for="chartType">Chart Type</label>
      <select id="chartType" v-model="chartConfig.chartType">
        <option v-for="(value, key) in ChartType" :key="value" :value="value">
          {{ key }}
        </option>
      </select>
    </div>

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

    <!-- group by selector -->
    <div class="mt-4">
      <label for="groupBy">Group By</label>
      <select id="groupBy" v-model="chartConfig.groupBy" multiple>
        <option v-for="(value, key) in GroupKey" :key="value" :value="value">
          {{ key }}
        </option>
      </select>
    </div>

    <!-- x-axis field selector -->
    <div class="mt-4">
      <label for="xAxisField">X-Axis Field</label>
      <select id="xAxisField" v-model="chartConfig.xAxisField">
        <option
          v-for="(value, key) in DataPointValue"
          :key="value"
          :value="value"
        >
          {{ key }}
        </option>
      </select>
    </div>

    <!-- y-axis field selector -->
    <div class="mt-4">
      <label for="yAxisField">Y-Axis Field</label>
      <select id="yAxisField" v-model="chartConfig.yAxisField">
        <option
          v-for="(value, key) in DataPointValue"
          :key="value"
          :value="value"
        >
          {{ key }}
        </option>
      </select>
    </div>

    <!-- chart content -->
    <div class="flex flex-col">
      <div class="flex-grow">
        <Bar :data="chartData" :options="chartOptions"> </Bar>
      </div>
      <div class="flex-grow">
        <Doughnut :data="chartData" :options="chartOptions"> </Doughnut>
      </div>
      <div class="flex-grow">
        <Line :data="chartData" :options="chartOptions"> </Line>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { Bar, Doughnut, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useStyleStore } from "../../stores/style";
import { getChartData } from "../../common/charts/charts";
import {
  PeriodType,
  type ChartConfig,
  GroupKey,
  DataPointValue,
  ChartType,
} from "../../common/charts/charts.types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  ArcElement,
  PointElement,
  LineElement,
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
  chartType: ChartType.BAR,
  periodType: PeriodType.THIS_WEEK,
  groupBy: [GroupKey.TASK],
  xAxisField: DataPointValue.TASK_NAME,
  yAxisField: DataPointValue.DURATION,
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
