import { toDurationString } from "../timeUtils";
import { getMonthName, getWeekdayName } from "./charts.utils";

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
  count: 1;
}
// Helper type to extract keys of T whose property values are assignable to `number`.
type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];
// This creates a type that is a union of all property names in DataPoint that are numbers.
type NumericDataPointKeys = NumericKeys<DataPoint>;
export const NumericDataPointValues: NumericDataPointKeys[] = [
  "time_entry_id",
  "duration",
  "weekday",
  "month",
  "year",
  "count",
  "start_time",
  "end_time",
];

export enum PeriodType {
  TODAY = "Today",
  YESTERDAY = "Yesterday",
  THIS_WEEK = "This week",
  LAST_WEEK = "Last week",
  THIS_MONTH = "This month",
  LAST_MONTH = "Last month",
  THIS_YEAR = "This year",
  LAST_YEAR = "Last year",
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
  START_TIME: "start_time",
  END_TIME: "end_time",
} as const satisfies Record<string, keyof DataPoint>;
export type DataPointValue =
  (typeof DataPointValue)[keyof typeof DataPointValue];

export const GroupKey = {
  ENTRY: "time_entry_id",
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
  [GroupKey.ENTRY]: [
    DataPointValue.TASK_NAME,
    DataPointValue.WEEKDAY,
    DataPointValue.MONTH,
    DataPointValue.YEAR,
    DataPointValue.START_TIME,
    DataPointValue.END_TIME,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
  [GroupKey.TASK]: [
    DataPointValue.TASK_NAME,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
  [GroupKey.TAG]: [
    DataPointValue.TAG_NAME,
    DataPointValue.TAG_COLOR,
    DataPointValue.TAG_DOT_TEXT,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
  [GroupKey.WEEKDAY]: [
    DataPointValue.WEEKDAY,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
  [GroupKey.MONTH]: [
    DataPointValue.MONTH,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
  [GroupKey.YEAR]: [
    DataPointValue.YEAR,
    DataPointValue.DURATION,
    DataPointValue.COUNT,
  ],
} as const satisfies Record<GroupKey, readonly DataPointValue[]>;

export interface DataPointGroup {
  groupKeys: GroupKeys;
  rawData: DataPoint[];
  values: {
    [key in DataPointValue]?: string | number | null;
  };
}

export enum ChartType {
  BAR = "Bar",
  LINE = "Line",
  DOUGHNUT = "Doughnut",
}

export interface ChartConfig {
  title: string;
  description: string;
  chartType: ChartType;
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

export interface DataPointValueAesthetic {
  getLabelX: (dataPointGroup: DataPointGroup) => string;
  getLabelY: (dataPointGroup: DataPointGroup) => string;
  getTickLabel: (value: any) => string;
  description: string;
}

export const DataPointValueAesthetics = {
  [DataPointValue.COUNT]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.COUNT]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.COUNT]),
    getTickLabel: (value: any) => String(value),
    description: "Count",
  },
  [DataPointValue.DURATION]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.DURATION]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.DURATION]),
    getTickLabel: (value: any) => toDurationString(value),
    description: "Duration",
  },
  [DataPointValue.TASK_NAME]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TASK_NAME]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TASK_NAME]),
    getTickLabel: (value: any) => String(value),
    description: "Task Name",
  },
  [DataPointValue.TAG_NAME]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_NAME] ?? "untagged"),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_NAME] ?? "untagged"),
    getTickLabel: (value: any) => String(value),
    description: "Tag Name",
  },
  [DataPointValue.TAG_COLOR]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_COLOR]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_COLOR]),
    getTickLabel: (value: any) => String(value),
    description: "Tag Color",
  },
  [DataPointValue.TAG_DOT_TEXT]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_DOT_TEXT]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.TAG_DOT_TEXT]),
    getTickLabel: (value: any) => String(value),
    description: "Tag Dot Text",
  },
  [DataPointValue.WEEKDAY]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      getWeekdayName(Number(dataPointGroup.values[DataPointValue.WEEKDAY])),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      getWeekdayName(Number(dataPointGroup.values[DataPointValue.WEEKDAY])),
    getTickLabel: (value: any) => getWeekdayName(Number(value)),
    description: "Weekday",
  },
  [DataPointValue.MONTH]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      getMonthName(Number(dataPointGroup.values[DataPointValue.MONTH])),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      getMonthName(Number(dataPointGroup.values[DataPointValue.MONTH])),
    getTickLabel: (value: any) => getMonthName(Number(value)),
    description: "Month",
  },
  [DataPointValue.YEAR]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.YEAR]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.YEAR]),
    getTickLabel: (value: any) => String(value),
    description: "Year",
  },
  [DataPointValue.START_TIME]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.START_TIME]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.START_TIME]),
    getTickLabel: (value: any) => new Date(value).toLocaleString(),
    description: "Start Time",
  },
  [DataPointValue.END_TIME]: {
    getLabelX: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.END_TIME]),
    getLabelY: (dataPointGroup: DataPointGroup) =>
      String(dataPointGroup.values[DataPointValue.END_TIME]),
    getTickLabel: (value: any) => new Date(value).toLocaleString(),
    description: "End Time",
  },
} as const satisfies Record<DataPointValue, DataPointValueAesthetic>;

export const GroupKeysAesthetics = {
  [GroupKey.ENTRY]: {
    description: "Time entry",
  },
  [GroupKey.TASK]: {
    description: "Task",
  },
  [GroupKey.TAG]: {
    description: "Tag",
  },
  [GroupKey.WEEKDAY]: {
    description: "Weekday",
  },
  [GroupKey.MONTH]: {
    description: "Month",
  },
  [GroupKey.YEAR]: {
    description: "Year",
  },
} as const satisfies Record<
  GroupKey,
  {
    description: string;
  }
>;
