<template>
  <!-- page content -->
  <div class="p-4 flex flex-col h-full">
    <div id="chartHeader" class="flex">
      <div id="chartTitle" class="flex-1">
        <!-- chart title -->
        <div>
          <input
            type="text"
            name="title"
            id="title"
            v-model="chartConfig.title"
            placeholder="Title"
            class="w-full focus:outline-none focus:border-none text-2xl font-bold caret-primary"
          />
        </div>

        <!-- chart description -->
        <div>
          <input
            type="text"
            name="description"
            id="description"
            v-model="chartConfig.description"
            placeholder="Description"
            class="w-full focus:outline-none focus:border-none text-xl caret-primary"
          />
        </div>
      </div>
      <div id="chartActions" class="flex gap-2 items-center">
        <AppButton class="cursor-pointer">
          <template #icon>
            <CheckCircleIcon />
          </template>
          SAVE
        </AppButton>
        <AppButton class="cursor-pointer" variant="accent">
          <template #icon>
            <TrashIcon />
          </template>
          DELETE
        </AppButton>
      </div>
    </div>

    <!-- chart configuration -->
    <table
      id="chartConfiguration"
      class="mt-2 table-auto border-separate border-spacing-y-2"
    >
      <tbody>
        <!-- chart type selector -->
        <tr>
          <td class="w-[80px]"><h3 class="text-text/70">Type</h3></td>
          <td>
            <AppSelect
              id="chartType"
              :choices="Object.values(ChartType)"
              v-model="chartConfig.chartType"
              :multiple="false"
            >
            </AppSelect>
          </td>
        </tr>

        <!-- period type selector -->
        <tr>
          <td><h3 class="text-text/70">Period</h3></td>
          <td>
            <AppSelect
              id="periodType"
              :choices="Object.values(PeriodType)"
              v-model="chartConfig.periodType"
              :multiple="false"
            />
          </td>
        </tr>

        <!-- group by selector -->
        <tr>
          <td><h3 class="text-text/70">Group</h3></td>
          <td>
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
          </td>
        </tr>

        <!-- y-axis field selector -->
        <tr>
          <td><h3 class="text-text/70">Y Axis</h3></td>
          <td>
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
          </td>
        </tr>
      </tbody>
    </table>

    <!-- chart content -->
    <div
      v-if="chartData.points.x.length > 0"
      class="p-4 mt-2 grow rounded-sm grainy bg-background dark:bg-blend-overlay border-text/10 border-1"
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
import AppButton from "../AppButton.vue";
import { CheckCircleIcon, TrashIcon } from "@heroicons/vue/24/solid";

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
