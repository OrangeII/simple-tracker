import { data } from "./charts.mockdata";
import { generateRandomColor } from "../colorUtils";
import type { ChartConfig, DataPoint, ChartData } from "./charts.types";
import { getDateIntevealFromPeriodType } from "./charts.utils";

export function selectData(config: ChartConfig): DataPoint[] {
  const { start, end } = getDateIntevealFromPeriodType(config.periodType);
  return data.filter(
    (item) =>
      new Date(item.start_time) >= start && new Date(item.end_time) < end
  );
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

  const xField = "task_name";
  const yFields = ["duration"];
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
