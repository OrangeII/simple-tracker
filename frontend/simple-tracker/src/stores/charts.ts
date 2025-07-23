import { defineStore } from "pinia";
import { ref } from "vue";
import {
  type ChartConfigRecord,
  saveChartConfig,
  fetchChartConfigs,
} from "../common/charts/charts.supabase";

/**
 * this store holds the users chart configurations.
 * It allows to fetch, save and update chart configurations.
 */
export const useChartStore = defineStore("charts", () => {
  const chartConfigs = ref<ChartConfigRecord[]>([]);

  async function fetchConfigs() {
    chartConfigs.value = await fetchChartConfigs();
  }

  async function saveConfig(chartConfig: ChartConfigRecord) {
    const success = await saveChartConfig(chartConfig);
    if (success) {
      // upsert to the local store
      const index = chartConfigs.value.findIndex(
        (config) => config.id === chartConfig.id
      );
      if (index !== -1) {
        chartConfigs.value[index] = chartConfig;
      } else {
        chartConfigs.value.push(chartConfig);
      }
    }
  }

  return {
    chartConfigs,
    fetchConfigs,
    saveConfig,
  };
});
