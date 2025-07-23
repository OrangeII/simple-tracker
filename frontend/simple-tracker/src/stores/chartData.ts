import { defineStore } from "pinia";
import { type DataPoint } from "../common/charts/charts.types";
import { fetchRawData } from "../common/charts/charts.supabase";
import { ref } from "vue";

export const useChartDataStore = defineStore("chartData", () => {
  const rawChartData = ref<DataPoint[]>([]);
  const isLoading = ref(false);

  async function refreshChartData() {
    isLoading.value = true;
    const data = await fetchRawData();
    rawChartData.value = data;
    isLoading.value = false;
  }

  return {
    rawChartData,
    refreshChartData,
  };
});
