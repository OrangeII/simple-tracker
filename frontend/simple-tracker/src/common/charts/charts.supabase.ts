import { supabase } from "../../main";
import type { DataPoint } from "./charts.types";

const DATA_TABLE_NAME = "time_entry_report";

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
