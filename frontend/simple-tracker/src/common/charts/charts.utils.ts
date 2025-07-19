import {
  GroupKey,
  PeriodType,
  GroupValueSettersConfig,
  DataPointValue,
  NumericDataPointValues,
} from "./charts.types";

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

export function getAllowedXFields(GroupKeys: GroupKey[]): DataPointValue[] {
  // allowed x fields are the ones that are brought in by the group keys
  const allowedXFields: DataPointValue[] = [];

  GroupKeys.forEach((key) => {
    const fields = GroupValueSettersConfig[key];
    //merge the fields into the allowedXFields array
    fields.forEach((field) => {
      if (!allowedXFields.includes(field)) {
        allowedXFields.push(field);
      }
    });
  });

  return allowedXFields;
}

export function getAllowedYFields(GroupKeys: GroupKey[]): DataPointValue[] {
  // allowed y fields are the subset of numeric fields allowed in the X axis
  const allowedXFields = getAllowedXFields(GroupKeys);
  return allowedXFields.filter((field) =>
    //check if field is allowed as a numeric data point value
    (NumericDataPointValues as readonly DataPointValue[]).includes(field)
  );
}

export function getWeekdayName(weekday: number): string {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekdays[weekday] || "";
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month] || "";
}
