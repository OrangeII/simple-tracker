import { defineStore } from "pinia";
import { computed } from "vue";
import { useStyleStore } from "./style";
import {
  DataPointValueAesthetics,
  type ChartConfig,
} from "../common/charts/charts.types";

export const useChartHelpersStore = defineStore("chartHelpers", () => {
  const styleStore = useStyleStore();

  const chartTextColor = computed(() => {
    return styleStore.getTextColor();
  });
  const chartGridColor = computed(() => {
    return chartTextColor.value + "40";
  });

  const chartTooltipConfig = (chartConfig: ChartConfig) => ({
    callbacks: {
      label: (context: any) => {
        const label = context.dataset.label || "";
        const value = context.raw;
        return `${label}: ${DataPointValueAesthetics[
          chartConfig.yAxisField
        ].getTickLabel(value)}`;
      },
    },
  });

  const chartTicksConfigY = (chartConfig: ChartConfig) => ({
    color: chartTextColor.value,
    callback: (value: any) => {
      return chartConfig.yAxisField
        ? DataPointValueAesthetics[chartConfig.yAxisField].getTickLabel(value)
        : value.toString();
    },
  });

  return {
    chartTextColor,
    chartGridColor,
    chartTooltipConfig,
    chartTicksConfigY,
  };
});
