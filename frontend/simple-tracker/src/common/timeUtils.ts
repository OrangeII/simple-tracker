/**
 *
 * @param time a date object representing a duration
 * @returns the duration in the format "HH:MM:SS"
 */
export const toDurationString = (time: Date) => {
  if (!time) {
    return "00:00:00";
  }

  const ms = Math.abs(+time);

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const padZero = (num: number) => num.toString().padStart(2, "0");

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};

/**
 * returns a string representation of the given date
 * @param date a date object
 * @returns "today" if the date is today, "yesterday" if the date is yesterday, toLocaleDateString() otherwise
 */
export const toEntriesDateString = (date: Date) => {
  const entriesDate = new Date(date);
  entriesDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (entriesDate.getTime() === today.getTime()) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (entriesDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return entriesDate.toLocaleDateString();
};
