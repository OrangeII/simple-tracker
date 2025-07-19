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
        <option v-for="value in allowedXFields" :key="value" :value="value">
          {{ getDataPointValueKey(value) }}
        </option>
      </select>
    </div>

    <!-- y-axis field selector -->
    <div class="mt-4">
      <label for="yAxisField">Y-Axis Field</label>
      <select id="yAxisField" v-model="chartConfig.yAxisField">
        <option v-for="value in allowedYFields" :key="value" :value="value">
          {{ getDataPointValueKey(value) }}
        </option>
      </select>
    </div>

    <!-- chart content -->
    <div class="flex flex-col">
      <div class="flex-grow">
        <AppBarChart
          :chartConfig="chartConfig"
          :chartData="chartData"
        ></AppBarChart>
      </div>
      <div class="flex-grow">
        <AppDoughnutChart :chartConfig="chartConfig" :chartData="chartData">
        </AppDoughnutChart>
      </div>
      <div class="flex-grow">
        <AppLineChart
          :chartConfig="chartConfig"
          :chartData="chartData"
        ></AppLineChart>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getChartData } from "../../common/charts/charts";
import {
  PeriodType,
  type ChartConfig,
  GroupKey,
  DataPointValue,
  ChartType,
} from "../../common/charts/charts.types";
import {
  getAllowedXFields,
  getAllowedYFields,
} from "../../common/charts/charts.utils";
import AppBarChart from "./AppBarChart.vue";
import AppDoughnutChart from "./AppDoughnutChart.vue";
import AppLineChart from "./AppLineChart.vue";

const chartData = computed(() => {
  return getChartData(chartConfig.value);
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

const allowedXFields = computed(() => {
  return getAllowedXFields(chartConfig.value.groupBy);
});

const allowedYFields = computed(() => {
  return getAllowedYFields(chartConfig.value.groupBy);
});

watch(
  () => chartConfig.value.groupBy,
  (_newGroupBy) => {
    const allowedX = allowedXFields.value;
    if (!allowedX.includes(chartConfig.value.xAxisField)) {
      chartConfig.value.xAxisField = allowedX[0];
    }
    const allowedY = allowedYFields.value;
    if (!allowedY.includes(chartConfig.value.yAxisField)) {
      chartConfig.value.yAxisField = allowedY[0];
    }
  }
);

const getDataPointValueKey = (value: DataPointValue) => {
  return Object.keys(DataPointValue).find(
    (key) => DataPointValue[key as keyof typeof DataPointValue] === value
  );
};
</script>
