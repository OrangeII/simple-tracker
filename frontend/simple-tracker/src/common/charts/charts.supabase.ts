import { supabase } from "../../main";
import type { ChartConfig, DataPoint } from "./charts.types";

const DATA_TABLE_NAME = "time_entry_report";

export interface ChartConfigRecord {
  id: string | null;
  user_id: string | null;
  created_at: string | null;
  chart_config: ChartConfig;
}

export async function fetchRawData(
  startPeriod?: Date,
  endPeriod?: Date
): Promise<DataPoint[]> {
  try {
    const { data, error } = await supabase
      .from(DATA_TABLE_NAME)
      .select("*")
      .gte("start_time", startPeriod?.toISOString() || "1970-01-01T00:00:00Z")
      .lt("end_time", endPeriod?.toISOString() || "9999-12-31T23:59:59Z")
      .order("start_time", { ascending: true });
    if (error) throw error;
    if (!data) {
      console.warn("No data found in fetchRawData");
      return [];
    }

    data.forEach((item) => {
      item.start_time = new Date(item.start_time).getTime();
      item.end_time = new Date(item.end_time).getTime();
    });

    return data as DataPoint[];
  } catch (error) {
    console.error("Error in fetchRawData:", error);
    throw error;
  }
}

export async function fetchChartConfigs(): Promise<ChartConfigRecord[]> {
  try {
    const { data, error } = await supabase
      .from("charts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ChartConfigRecord[];
  } catch (error) {
    console.error("Error in fetchChartConfigs:", error);
    throw error;
  }
}

/**
 * Saves a chart configuration to the database. and returns the saved record.
 * If the chart configuration already exists, it will be updated.
 * @param chartConfig the chart configuration to save
 * @returns the saved chart configuration record
 */
export async function saveChartConfig(
  chartConfig: ChartConfigRecord
): Promise<ChartConfigRecord> {
  try {
    if (!chartConfig.id) {
      chartConfig.id = null;
    }
    if (!chartConfig.user_id) {
      chartConfig.user_id = null;
    }
    if (!chartConfig.created_at) {
      chartConfig.created_at = null;
    }
    const { data, error } = await supabase
      .from("charts")
      .upsert(chartConfig, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data as ChartConfigRecord;
  } catch (error) {
    console.error("Error in saveChartConfig:", error);
    throw error;
  }
}
