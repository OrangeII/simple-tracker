import { data as rawData } from "./charts.mockdata";
import { generateRandomColor } from "../colorUtils";
import {
  type ChartConfig,
  type DataPoint,
  type ChartData,
  type DataPointGroup,
  type GroupKeys,
  DataPointValue,
  GroupValueSettersConfig,
} from "./charts.types";
import { getDateIntevealFromPeriodType } from "./charts.utils";

function selectData(config: ChartConfig): DataPoint[] {
  const { start, end } = getDateIntevealFromPeriodType(config.periodType);
  return rawData.filter(
    (item) =>
      new Date(item.start_time) >= start && new Date(item.end_time) < end
  );
}

function groupData(config: ChartConfig, data: DataPoint[]): any {
  const groupedData: Record<string, DataPointGroup> = {};

  data.forEach((item) => {
    // compute the group key based on the groupBy configuration
    const groupKeys: GroupKeys = {};
    const groupKeysValues: (string | number | null)[] = [];
    for (const key of config.groupBy) {
      groupKeysValues.push(item[key]);
      groupKeys[key] = item[key];
    }
    const groupKey = groupKeysValues.join("-");

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = { rawData: [], groupKeys, values: {} };
      // set the values for the group using the GroupValueSettersConfig
      for (const key of config.groupBy) {
        for (const valueToSet of GroupValueSettersConfig[key]) {
          groupedData[groupKey].values[valueToSet] = item[valueToSet];
        }
      }
    }
    // only add the item if that group does not already contain a datapoint with the same time_entry_id
    if (
      !groupedData[groupKey].rawData.some(
        (d) => d.time_entry_id === item.time_entry_id
      )
    ) {
      // push the raw item to the group
      groupedData[groupKey].rawData.push(item);
    }
  });

  return groupedData;
}

export function getChartData(config: ChartConfig): ChartData {
  const selectedData: DataPoint[] = selectData(config);
  const groupedData: Record<string, DataPointGroup> = groupData(
    config,
    selectedData
  );
  console.log("groupedData", groupedData);
  const chartData: ChartData = {
    points: {
      x: [],
      ys: [],
    },
    config,
  };

  const xField: DataPointValue = DataPointValue.TASK_NAME;
  const yFields: DataPointValue[] = [DataPointValue.DURATION];

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
