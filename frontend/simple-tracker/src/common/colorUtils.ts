/**
 * Generates a random hex color similar to the app's color palette
 * @returns A hex color string (e.g., '#4db9d1')
 */
export const generateRandomColor = (): string => {
  // Base hues from the app's palette
  const baseHues = [
    { h: 200, s: 60, l: 55 }, // blue
    { h: 40, s: 45, l: 50 }, // gold
    { h: 10, s: 70, l: 60 }, // orange
    { h: 160, s: 50, l: 45 }, // green
    { h: 280, s: 45, l: 55 }, // purple
    { h: 340, s: 55, l: 50 }, // pink
  ];

  const selectedBase = baseHues[Math.floor(Math.random() * baseHues.length)];

  // Add significant variation while keeping colors vibrant
  const hue = (selectedBase.h + Math.random() * 60 - 30) % 360;
  const saturation = Math.min(
    90,
    Math.max(30, selectedBase.s + Math.random() * 40 - 20)
  );
  const lightness = Math.min(
    80,
    Math.max(30, selectedBase.l + Math.random() * 40 - 20)
  );

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return hslToHex(hue, saturation, lightness);
};
