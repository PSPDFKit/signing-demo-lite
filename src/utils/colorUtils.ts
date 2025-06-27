import { ColorObject } from '../types';

export const randomColor = (PSPDFKit: any, usedColors: any[] = []) => {
  const colors: any = [
    PSPDFKit.Color.LIGHT_GREY,
    PSPDFKit.Color.LIGHT_GREEN,
    PSPDFKit.Color.LIGHT_YELLOW,
    PSPDFKit.Color.LIGHT_ORANGE,
    PSPDFKit.Color.LIGHT_RED,
    PSPDFKit.Color.LIGHT_BLUE,
    PSPDFKit.Color.fromHex("#0ffcf1"),
  ];
  
  const availableColors = colors.filter(
    (color: any) => !usedColors.includes(color as any)
  );
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex] || colors[Math.floor(Math.random() * colors.length)];
};

export const parseColorObject = (colorString?: string): ColorObject | null => {
  if (!colorString) return null;
  
  const jsonString = colorString.substring(2).replace(/(\w+):/g, '"$1":');
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse color object:', error);
    return null;
  }
};

export const colorToRGB = (colorObject: ColorObject): string => {
  return `rgb(${colorObject.r},${colorObject.g},${colorObject.b})`;
};