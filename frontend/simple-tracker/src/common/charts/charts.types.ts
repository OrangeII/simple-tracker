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

export const DataPointValue = {
  TASK_NAME: "task_name",
  TAG_NAME: "tag_name",
  TAG_COLOR: "tag_color",
  TAG_DOT_TEXT: "tag_dot_text",
  DURATION: "duration",
  WEEKDAY: "weekday",
  MONTH: "month",
  YEAR: "year",
  COUNT: "count",
} as const satisfies Record<string, keyof DataPoint | "count">;
export type DataPointValue =
  (typeof DataPointValue)[keyof typeof DataPointValue];

export const GroupKey = {
  TASK: "task_id",
  TAG: "tag_id",
  WEEKDAY: "weekday",
  MONTH: "month",
  YEAR: "year",
} as const satisfies Record<string, keyof DataPoint>;
export type GroupKey = (typeof GroupKey)[keyof typeof GroupKey];

export type GroupKeys = {
  [key in GroupKey]?: string | number | null;
};

/**
 * Configuration for which data points should be set for each group key.
 * for example, for the TASK group key, we want to set the task name.
 * for the TAG group key, we want to set the tag name, tag color, ...
 */
export const GroupValueSettersConfig = {
  [GroupKey.TASK]: [DataPointValue.TASK_NAME],
  [GroupKey.TAG]: [
    DataPointValue.TAG_NAME,
    DataPointValue.TAG_COLOR,
    DataPointValue.TAG_DOT_TEXT,
  ],
  [GroupKey.WEEKDAY]: [DataPointValue.WEEKDAY],
  [GroupKey.MONTH]: [DataPointValue.MONTH],
  [GroupKey.YEAR]: [DataPointValue.YEAR],
} as const satisfies Record<GroupKey, readonly DataPointValue[]>;

export interface DataPointGroup {
  groupKeys: GroupKeys;
  rawData: DataPoint[];
  values: {
    [key in DataPointValue]?: string | number | null;
  };
}

export interface ChartConfig {
  title: string;
  description: string;
  periodType: PeriodType;
  groupBy: GroupKey[];
  xAxisField: DataPointValue;
  yAxisField: DataPointValue;
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
