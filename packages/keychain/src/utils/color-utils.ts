/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Generates 5-6 shades of a given color
 * Creates lighter and darker variations
 */
export function generateColorShades(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const shades: string[] = [];

  // Generate 6 shades: 2 lighter, base, 3 darker
  const factors = [0.4, 0.7, 1.0, 1.3, 1.6, 1.9];

  factors.forEach((factor) => {
    if (factor < 1) {
      // Lighter shades - move towards white
      const r = rgb.r + (255 - rgb.r) * (1 - factor);
      const g = rgb.g + (255 - rgb.g) * (1 - factor);
      const b = rgb.b + (255 - rgb.b) * (1 - factor);
      shades.push(rgbToHex(r, g, b));
    } else {
      // Darker shades - multiply by factor
      const r = Math.min(255, rgb.r * (2 - factor));
      const g = Math.min(255, rgb.g * (2 - factor));
      const b = Math.min(255, rgb.b * (2 - factor));
      shades.push(rgbToHex(r, g, b));
    }
  });

  return shades;
}
