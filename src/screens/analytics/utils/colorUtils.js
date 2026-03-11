/**
 * Parses a hex color string into its RGB components.
 * Falls back to a default cyan if the hex is invalid.
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 50, g: 194, b: 255 };
};

/**
 * Returns an rgba() string for the given hex color + opacity.
 */
export const withOpacity = (hex, opacity) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
};