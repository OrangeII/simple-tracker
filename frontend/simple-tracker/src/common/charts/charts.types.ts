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

export const GroupType = {
  TASK: "task_id",
  TAG: "tag_id",
  WEEKDAY: "weekday",
  MONTH: "month",
  YEAR: "year",
} as const satisfies Record<string, keyof DataPoint>;
export type GroupType = (typeof GroupType)[keyof typeof GroupType];

export interface ChartConfig {
  title: string;
  description: string;
  periodType: PeriodType;
  groupBy: GroupType[];
}

export interface ChartData {
  points: {
    x: any[];
    ys: {
      data: any[];
      label: string;
      backgroundColor: string[];
    }[];
  };
  config: ChartConfig;
}
