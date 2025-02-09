export const toTimeString = (time: Date) => {
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
