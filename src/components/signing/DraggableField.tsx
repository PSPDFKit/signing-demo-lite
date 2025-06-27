import React from 'react';
import { AnnotationTypeEnum, DraggableFieldProps, ColorObject } from '../../types';
import { initialsSVG, signSVG, personSVG, dateSVG } from '../../utils/icons';
import { colorToRGB } from '../../utils/colorUtils';
import { sidebarStyles } from '../../styles/sidebarStyles';

export const DraggableField: React.FC<DraggableFieldProps> = ({
  className,
  type,
  label,
  onDragStart,
  onDragEnd,
  userColor,
}) => {
  const id = `${type}-icon`;
  
  let icon = signSVG;
  switch (type) {
    case AnnotationTypeEnum.NAME:
      icon = personSVG;
      break;
    case AnnotationTypeEnum.SIGNATURE:
      icon = signSVG;
      break;
    case AnnotationTypeEnum.DATE:
      icon = dateSVG;
      break;
    case AnnotationTypeEnum.INITIAL:
      icon = initialsSVG;
      break;
    default:
      icon = signSVG;
      break;
  }

  const backgroundColor = userColor 
    ? colorToRGB(userColor as ColorObject)
    : 'white';

  return (
    <div
      draggable={true}
      onDragStart={async (e) => await onDragStart(e, type)}
      onDragEnd={(e) => onDragEnd(e)}
      style={sidebarStyles.draggableField}
    >
      <div className="heading-custom-style">
        <span
          style={{
            ...sidebarStyles.fieldIcon,
            backgroundColor,
          }}
        >
          {icon}
        </span>
        <span style={sidebarStyles.fieldLabel}>{label}</span>
      </div>
    </div>
  );
};