import { data } from "./charts.mockdata";

export interface DataPoint {
  time_entry_id: number;
  time_entry_notes: string | null;
  task_id: string;
  start_time: number;
  end_time: number;
  task_name: string;
  tag_id: string | null;
  tag_name: string | null;
  tag_color: string | null;
  tag_dot_text: string | null;
  duration: number;
  weekday: number;
  month: number;
  year: number;
  [key: string]: string | number | null;
}

export enum PeriodType {
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_WEEK = "this_week",
  LAST_WEEK = "last_week",
  THIS_MONTH = "this_month",
  LAST_MONTH = "last_month",
  THIS_YEAR = "this_year",
  LAST_YEAR = "last_year",
}

export interface ChartConfig {
  title: string;
  description: string;
  periodType: PeriodType;
}

export function getDateIntevealFromPeriodType(periodType: PeriodType): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (periodType) {
    case PeriodType.TODAY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    case PeriodType.YESTERDAY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    case PeriodType.THIS_WEEK:
      start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    case PeriodType.LAST_WEEK:
      start = new Date(now);
      start.setDate(start.getDate() - (start.getDay() + 7));
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    case PeriodType.THIS_MONTH:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case PeriodType.LAST_MONTH:
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case PeriodType.THIS_YEAR:
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case PeriodType.LAST_YEAR:
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      throw new Error("Invalid period type");
  }

  return { start, end };
}

export function selectData(config: ChartConfig): DataPoint[] {
  const { start, end } = getDateIntevealFromPeriodType(config.periodType);
  return data.filter(
    (item) =>
      new Date(item.start_time) >= start && new Date(item.end_time) < end
  );
}

export interface ChartData {
  points: {
    x: any[];
    ys: {
      data: any[];
      label: string;
    }[];
  };
  config: ChartConfig;
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
  const yField = "duration";
  const x = selectedData.map((item) => item[xField]);
  const ys = {
    data: selectedData.map((item) => item[yField]),
    label: yField,
  };

  chartData.points.x = x;
  chartData.points.ys = [ys];

  return chartData;
}
