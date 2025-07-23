import {
  type ChartConfig,
  type DataPoint,
  type ChartData,
  type DataPointGroup,
  type GroupKeys,
  DataPointValue,
  GroupValueSettersConfig,
  DataPointValueAesthetics,
  GroupKeysAesthetics,
} from "./charts.types";
import { getDateIntevealFromPeriodType } from "./charts.utils";

function filterData(config: ChartConfig, rawData: DataPoint[]): DataPoint[] {
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

function aggregateData(
  _config: ChartConfig,
  groupedData: Record<string, DataPointGroup>
): Record<string, DataPointGroup> {
  const aggregatedData: Record<string, DataPointGroup> = {};

  for (const groupKey in groupedData) {
    const group = groupedData[groupKey];

    //compute total duration and count
    group.values[DataPointValue.DURATION] = group.rawData.reduce(
      (sum, item) => sum + item.duration,
      0
    );
    group.values[DataPointValue.COUNT] = group.rawData.length;

    aggregatedData[groupKey] = {
      groupKeys: group.groupKeys,
      rawData: group.rawData,
      values: group.values,
    };
  }

  return aggregatedData;
}

export function getChartData(
  config: ChartConfig,
  rawData: DataPoint[]
): ChartData {
  const selectedData: DataPoint[] = filterData(config, rawData);
  const groupedData: Record<string, DataPointGroup> = groupData(
    config,
    selectedData
  );
  const aggregatedData: Record<string, DataPointGroup> = aggregateData(
    config,
    groupedData
  );

  const chartData: ChartData = {
    points: {
      x: [],
      ys: [],
    },
    config,
  };

  const yFields: DataPointValue[] = [config.yAxisField];

  const aggregatedDataValues = Object.values(aggregatedData);

  const x = aggregatedDataValues.map((item) => {
    const labels = config.groupBy.map((key) => {
      const aesthetic = GroupKeysAesthetics[key];
      return aesthetic.getLabelX(item);
    });
    // keep unique labels
    const uniqueLabels = new Set(labels);
    return Array.from(uniqueLabels).join(" - ");
  });
  const ys = yFields.map((yField) => ({
    data: aggregatedDataValues.map((item) => item.values[yField]),
    label: DataPointValueAesthetics[yField].description,
    backgroundColor: aggregatedDataValues.map((item) =>
      String(item.values[DataPointValue.TAG_COLOR] ?? "")
    ),
  }));

  chartData.points.x = x;
  chartData.points.ys = ys;
  return chartData;
}
