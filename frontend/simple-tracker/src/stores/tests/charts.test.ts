import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useChartsStore } from "../charts";
import * as chartsSupabase from "../../common/charts/charts.supabase";
import type { ChartConfigRecord } from "../../common/charts/charts.supabase";
import {
  ChartType,
  DataPointValue,
  GroupKey,
  PeriodType,
} from "../../common/charts/charts.types";

vi.mock("../../common/charts/charts.supabase", () => ({
  fetchChartConfigs: vi.fn(),
  saveChartConfig: vi.fn(),
  deleteChartConfig: vi.fn(),
}));

const createMockChartConfig = (id: string): ChartConfigRecord => ({
  id,
  user_id: "user-1",
  created_at: new Date().toISOString(),
  chart_config: {
    title: `Chart ${id}`,
    description: `Description for chart ${id}`,
    chartType: ChartType.BAR,
    periodType: PeriodType.THIS_WEEK,
    groupBy: [GroupKey.TASK],
    xAxisField: DataPointValue.TASK_NAME,
    yAxisField: DataPointValue.DURATION,
  },
});

describe("useChartStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize with an empty chartConfigs array", () => {
    const store = useChartsStore();
    expect(store.chartConfigs).toEqual([]);
  });

  describe("fetchConfigs", () => {
    it("should fetch chart configurations and update the store", async () => {
      const mockConfigs = [
        createMockChartConfig("1"),
        createMockChartConfig("2"),
      ];
      vi.mocked(chartsSupabase.fetchChartConfigs).mockResolvedValue(
        mockConfigs
      );

      const store = useChartsStore();
      await store.fetchConfigs();

      expect(chartsSupabase.fetchChartConfigs).toHaveBeenCalledTimes(1);
      expect(store.chartConfigs).toEqual(mockConfigs);
    });

    it("should handle an empty array from fetchChartConfigs", async () => {
      vi.mocked(chartsSupabase.fetchChartConfigs).mockResolvedValue([]);

      const store = useChartsStore();
      await store.fetchConfigs();

      expect(store.chartConfigs).toEqual([]);
    });
  });

  describe("saveConfig", () => {
    it("should add a new config when saveChartConfig succeeds", async () => {
      const newConfig = createMockChartConfig("1");
      const mockResponse = {
        ...newConfig,
        created_at: new Date().toISOString(),
      };
      vi.mocked(chartsSupabase.saveChartConfig).mockResolvedValue(mockResponse);

      const store = useChartsStore();
      await store.saveConfig(newConfig);

      expect(chartsSupabase.saveChartConfig).toHaveBeenCalledWith(newConfig);
      expect(store.chartConfigs).toContainEqual(mockResponse);
      expect(store.chartConfigs).toHaveLength(1);
    });

    it("should update an existing config when saveChartConfig succeeds", async () => {
      const existingConfig = createMockChartConfig("1");
      const updatedConfig = {
        ...existingConfig,
        chart_config: {
          ...existingConfig.chart_config,
          title: "Updated Chart",
        },
      };
      vi.mocked(chartsSupabase.saveChartConfig).mockResolvedValue(
        updatedConfig
      );

      const store = useChartsStore();
      store.chartConfigs = [existingConfig];

      await store.saveConfig(updatedConfig);

      expect(chartsSupabase.saveChartConfig).toHaveBeenCalledWith(
        updatedConfig
      );
      expect(store.chartConfigs).toContainEqual(updatedConfig);
      expect(store.chartConfigs).not.toContainEqual(existingConfig);
      expect(store.chartConfigs).toHaveLength(1);
    });

    it("should not modify the store if saveChartConfig fails", async () => {
      const newConfig = createMockChartConfig("1");
      vi.mocked(chartsSupabase.saveChartConfig).mockRejectedValue(
        new Error("Save failed")
      );
      const store = useChartsStore();
      await expect(store.saveConfig(newConfig)).rejects.toThrow("Save failed");
      expect(chartsSupabase.saveChartConfig).toHaveBeenCalledWith(newConfig);
      expect(store.chartConfigs).toEqual([]);
    });

    describe("deleteConfig", () => {
      it("should remove a config when deleteChartConfig succeeds", async () => {
        const existingConfig = createMockChartConfig("1");
        vi.mocked(chartsSupabase.deleteChartConfig).mockResolvedValue(true);

        const store = useChartsStore();
        store.chartConfigs = [existingConfig];

        const success = await store.deleteConfig(existingConfig.id!);

        expect(chartsSupabase.deleteChartConfig).toHaveBeenCalledWith(
          existingConfig.id
        );
        expect(success).toBe(true);
        expect(store.chartConfigs).toEqual([]);
      });

      it("should not modify the store if deleteChartConfig fails", async () => {
        const existingConfig = createMockChartConfig("1");
        vi.mocked(chartsSupabase.deleteChartConfig).mockResolvedValue(false);

        const store = useChartsStore();
        store.chartConfigs = [existingConfig];

        const success = await store.deleteConfig(existingConfig.id!);

        expect(chartsSupabase.deleteChartConfig).toHaveBeenCalledWith(
          existingConfig.id
        );
        expect(success).toBe(false);
        expect(store.chartConfigs).toEqual([existingConfig]);
      });
    });
  });
});
