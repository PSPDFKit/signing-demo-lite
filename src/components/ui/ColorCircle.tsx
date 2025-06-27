import React from 'react';
import { parseColorObject, colorToRGB } from '../../utils/colorUtils';

interface ColorCircleProps {
  color?: string;
  size?: number;
}

export const ColorCircle: React.FC<ColorCircleProps> = ({ color, size = 20 }) => {
  const colorObject = parseColorObject(color);
  
  if (!colorObject) return null;

  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill={colorToRGB(colorObject)}
      />
    </svg>
  );
};