import { supabase } from "../../main";
import type { ChartConfig, DataPoint } from "./charts.types";

const DATA_TABLE_NAME = "time_entry_report";

export interface ChartConfigRecord {
  id?: string;
  user_id?: string;
  created_at?: string;
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
    // If the chartConfig does not have an id, it means it's a new chart.
    // I clear everything except the chart_config field so that a new record will use default values.
    if (!chartConfig.id) {
      chartConfig = { chart_config: chartConfig.chart_config };
    }

    console.log("Saving chart config:", chartConfig);
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

/**
 * Deletes a chart configuration from the database.
 * @param id the id of the chart configuration to delete
 * @returns true if the chart configuration was deleted successfully, false otherwise
 */
export async function deleteChartConfig(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("charts")
      .delete()
      .eq("id", id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn(`No chart config found to delete with id: ${id}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteChartConfig:", error);
    throw error;
  }
}
