import { defineStore } from "pinia";
import { ref } from "vue";
import {
  type ChartConfigRecord,
  saveChartConfig,
  fetchChartConfigs,
  deleteChartConfig,
} from "../common/charts/charts.supabase";

/**
 * this store holds the users chart configurations.
 * It allows to fetch, save and update chart configurations.
 */
export const useChartsStore = defineStore("charts", () => {
  const chartConfigs = ref<ChartConfigRecord[]>([]);

  async function fetchConfigs() {
    chartConfigs.value = await fetchChartConfigs();
  }

  async function saveConfig(
    chartConfig: ChartConfigRecord
  ): Promise<ChartConfigRecord> {
    const updatedRecord = await saveChartConfig(chartConfig);
    if (updatedRecord) {
      // upsert to the local store
      const index = chartConfigs.value.findIndex(
        (config) => config.id === updatedRecord.id
      );
      if (index !== -1) {
        chartConfigs.value[index] = updatedRecord;
      } else {
        chartConfigs.value.push(updatedRecord);
      }
    }
    return updatedRecord;
  }

  async function deleteConfig(id: string): Promise<boolean> {
    const success = await deleteChartConfig(id);
    if (success) {
      const index = chartConfigs.value.findIndex((config) => config.id === id);
      if (index !== -1) {
        chartConfigs.value.splice(index, 1);
      }
    }
    return success;
  }

  return {
    chartConfigs,
    fetchConfigs,
    deleteConfig,
    saveConfig,
  };
});
