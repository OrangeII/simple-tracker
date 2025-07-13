import { PeriodType } from "./charts.types";

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
