import { data as rawData } from "./charts.mockdata";
import { generateRandomColor } from "../colorUtils";
import type { ChartConfig, DataPoint, ChartData } from "./charts.types";
import { getDateIntevealFromPeriodType } from "./charts.utils";

function selectData(config: ChartConfig): DataPoint[] {
  const { start, end } = getDateIntevealFromPeriodType(config.periodType);
  return rawData.filter(
    (item) =>
      new Date(item.start_time) >= start && new Date(item.end_time) < end
  );
}

function groupData(config: ChartConfig, data: DataPoint[]): any {
  const groupedData: Record<
    string,
    {
      data: DataPoint[];
    }
  > = {};

  data.forEach((item) => {
    const groupKey = config.groupBy.map((key) => item[key]).join("-");
    if (!groupedData[groupKey]) {
      groupedData[groupKey] = { data: [] };
    }
    // only add the item if that group does not already contain a datapoint with the same time_entry_id
    if (
      !groupedData[groupKey].data.some(
        (d) => d.time_entry_id === item.time_entry_id
      )
    ) {
      groupedData[groupKey].data.push(item);
    }
  });

  return groupedData;
}

export function getChartData(config: ChartConfig): ChartData {
  const selectedData: DataPoint[] = selectData(config);
  const chartData: ChartData = {
    points: {
      x: [],
      ys: [],
    },
    config,
  };

  const xField = "task_name" as keyof DataPoint;
  const yFields: (keyof DataPoint)[] = ["duration"];

  const x = selectedData.map((item) => item[xField]);
  const ys = yFields.map((yField) => ({
    data: selectedData.map((item) => item[yField]),
    label: yField,
    backgroundColor: selectedData.map((item) =>
      item.tag_color ? item.tag_color : generateRandomColor()
    ),
  }));

  chartData.points.x = x;
  chartData.points.ys = ys;

  return chartData;
}
