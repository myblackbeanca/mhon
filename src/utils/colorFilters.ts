import type { FilterType } from '../components/ColorFilters';

interface RGB {
  r: number;
  g: number;
  b: number;
}

const parseRGB = (color: string): RGB => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
};

const rgbToString = (rgb: RGB): string => {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
};

const enhanceVibrance = (rgb: RGB): RGB => {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  if (max === 0) return rgb;

  const saturationBoost = 1.3;
  const minBoost = 0.7;
  
  return {
    r: Math.min(255, rgb.r * (rgb.r === max ? saturationBoost : minBoost)),
    g: Math.min(255, rgb.g * (rgb.g === max ? saturationBoost : minBoost)),
    b: Math.min(255, rgb.b * (rgb.b === max ? saturationBoost : minBoost))
  };
};

export const applyColorFilter = (
  color: string,
  filter: FilterType,
  previousColor?: string
): string => {
  const rgb = parseRGB(color);
  const prev = previousColor ? parseRGB(previousColor) : undefined;

  switch (filter) {
    case 'vibrant':
      return applyVibrantFilter(rgb);
    case 'dynamic':
      return applyDynamicFilter(rgb);
    case 'frame-based':
      return color;
    case 'contrast':
      return applyContrastFilter(rgb);
    case 'neon':
      return applyNeonFilter(rgb);
    case 'gradient-flow':
      return applyGradientFlow(rgb, prev);
    default:
      return color;
  }
};

const applyVibrantFilter = (rgb: RGB): string => {
  const enhanced = enhanceVibrance(rgb);
  const brightness = (enhanced.r + enhanced.g + enhanced.b) / (3 * 255);
  const boost = brightness < 0.5 ? 1.4 : 1.1;

  return rgbToString({
    r: Math.min(255, enhanced.r * boost),
    g: Math.min(255, enhanced.g * boost),
    b: Math.min(255, enhanced.b * boost)
  });
};

const applyDynamicFilter = (rgb: RGB): string => {
  const brightness = (rgb.r + rgb.g + rgb.b) / (3 * 255);
  const contrast = brightness > 0.5 ? 1.3 : 0.8;
  
  return rgbToString({
    r: Math.min(255, Math.max(0, (rgb.r - 128) * contrast + 128)),
    g: Math.min(255, Math.max(0, (rgb.g - 128) * contrast + 128)),
    b: Math.min(255, Math.max(0, (rgb.b - 128) * contrast + 128))
  });
};

const applyContrastFilter = (rgb: RGB): string => {
  const threshold = 128;
  const contrastBoost = 1.4;
  
  return rgbToString({
    r: rgb.r > threshold ? Math.min(255, rgb.r * contrastBoost) : rgb.r / contrastBoost,
    g: rgb.g > threshold ? Math.min(255, rgb.g * contrastBoost) : rgb.g / contrastBoost,
    b: rgb.b > threshold ? Math.min(255, rgb.b * contrastBoost) : rgb.b / contrastBoost
  });
};

const applyNeonFilter = (rgb: RGB): string => {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const neonBoost = 1.5;
  const secondaryBoost = 0.6;
  
  return rgbToString({
    r: rgb.r === max ? Math.min(255, rgb.r * neonBoost) : rgb.r * secondaryBoost,
    g: rgb.g === max ? Math.min(255, rgb.g * neonBoost) : rgb.g * secondaryBoost,
    b: rgb.b === max ? Math.min(255, rgb.b * neonBoost) : rgb.b * secondaryBoost
  });
};

const applyGradientFlow = (rgb: RGB, prev?: RGB): string => {
  if (!prev) return rgbToString(enhanceVibrance(rgb));

  const flowFactor = 0.3;
  const enhanced = enhanceVibrance(rgb);
  const enhancedPrev = enhanceVibrance(prev);

  return rgbToString({
    r: enhanced.r * (1 - flowFactor) + enhancedPrev.r * flowFactor,
    g: enhanced.g * (1 - flowFactor) + enhancedPrev.g * flowFactor,
    b: enhanced.b * (1 - flowFactor) + enhancedPrev.b * flowFactor
  });
};