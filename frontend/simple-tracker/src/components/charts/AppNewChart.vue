<template>
  <!-- page content -->
  <div class="p-4 flex flex-col h-full">
    <!-- chart configuration -->
    <div id="chartConfiguration">
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
        <!-- <select id="chartType" v-model="chartConfig.chartType">
          <option v-for="value in ChartType" :key="value" :value="value">
            {{ value }}
          </option>
        </select> -->
        <AppSelect
          id="chartType"
          :choices="Object.values(ChartType)"
          v-model="chartConfig.chartType"
          :multiple="false"
        >
        </AppSelect>
      </div>

      <!-- period type selector -->
      <div class="mt-4">
        <label for="periodType">Period Type</label>
        <AppSelect
          id="periodType"
          :choices="Object.values(PeriodType)"
          v-model="chartConfig.periodType"
          :multiple="false"
        />
      </div>

      <!-- group by selector -->
      <div class="mt-4">
        <label for="groupBy">Group By</label>
        <AppSelect
          id="groupBy"
          :choices="Object.values(GroupKey)"
          :descriptions="
            Object.values(GroupKey).map(
              (key) => GroupKeysAesthetics[key].description
            )
          "
          v-model="chartConfig.groupBy"
          :multiple="true"
        >
        </AppSelect>
      </div>

      <!-- x-axis field selector -->
      <div class="mt-4">
        <label for="xAxisField">X-Axis Field</label>
        <AppSelect
          :choices="allowedXFields"
          v-model="chartConfig.xAxisField"
          :descriptions="
            allowedXFields.map(
              (field) => DataPointValueAesthetics[field].description
            )
          "
          :multiple="false"
        />
      </div>

      <!-- y-axis field selector -->
      <div class="mt-4">
        <label for="yAxisField">Y-Axis Field</label>
        <AppSelect
          id="yAxisField"
          :choices="allowedYFields"
          v-model="chartConfig.yAxisField"
          :descriptions="
            allowedYFields.map(
              (field) => DataPointValueAesthetics[field].description
            )
          "
          :multiple="false"
        />
      </div>
    </div>

    <!-- chart content -->
    <div
      v-if="chartData.points.x.length > 0"
      class="my-4 basis-48 grow rounded-sm grainy bg-background dark:bg-blend-overlay p-4"
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
      class="my-4 basis-48 grow rounded-sm grainy bg-background dark:bg-blend-overlay p-4 flex items-center justify-center h-full"
    >
      <p class="text-text/70">
        No data available for the selected configuration.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { getChartData } from "../../common/charts/charts";
import {
  PeriodType,
  type ChartConfig,
  GroupKey,
  DataPointValue,
  ChartType,
  DataPointValueAesthetics,
  GroupKeysAesthetics,
} from "../../common/charts/charts.types";
import {
  getAllowedXFields,
  getAllowedYFields,
} from "../../common/charts/charts.utils";
import AppBarChart from "./AppBarChart.vue";
import AppDoughnutChart from "./AppDoughnutChart.vue";
import AppLineChart from "./AppLineChart.vue";
import { useChartDataStore } from "../../stores/chartData";
import AppSelect from "../AppSelect.vue";

const chartDataStore = useChartDataStore();
onMounted(async () => {
  await chartDataStore.refreshChartData();
});

const chartData = computed(() => {
  return getChartData(chartConfig.value, chartDataStore.rawChartData);
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
</script>
