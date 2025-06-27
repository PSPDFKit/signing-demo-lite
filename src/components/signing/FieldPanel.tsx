import React from 'react';
import dynamic from 'next/dynamic';
import { AnnotationTypeEnum, User } from '../../types';
import { DraggableField } from './DraggableField';
import { sidebarStyles } from '../../styles/sidebarStyles';

const ActionButton = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.ActionButton),
  { ssr: false }
);

interface FieldPanelProps {
  currentSignee: User;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onApplyDigitalSignature: () => void;
}

export const FieldPanel: React.FC<FieldPanelProps> = ({
  currentSignee,
  onDragStart,
  onDragEnd,
  onApplyDigitalSignature
}) => {
  return (
    <div style={{ padding: "25px 15px" }}>
      <h3 style={sidebarStyles.sectionTitle}>
        Add fields
      </h3>
      <div style={sidebarStyles.sectionDescription}>
        Drag & drop fields on the document
      </div>
      
      <DraggableField
        className="mt-5"
        type={AnnotationTypeEnum.NAME}
        label="Name"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        userColor={currentSignee.color}
      />
      
      <DraggableField
        className="mt-5"
        type={AnnotationTypeEnum.SIGNATURE}
        label="Signature"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        userColor={currentSignee.color}
      />
      
      <DraggableField
        className="mt-5"
        type={AnnotationTypeEnum.INITIAL}
        label="Initial"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        userColor={currentSignee.color}
      />
      
      <DraggableField
        className="mt-5"
        type={AnnotationTypeEnum.DATE}
        label="Date"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        userColor={currentSignee.color}
      />
      
      <DraggableField 
        className="mt-5"
        type={AnnotationTypeEnum.DS}
        label="Digital Signature"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        userColor={{r: 255, g: 255, b: 255}}
      />
      
      <ActionButton
        label={"Apply Digital Signature"}
        size="md"
        onPress={onApplyDigitalSignature}
        className="custom-button"
        style={{ margin: "15px 0px 0px 0px" }}
      />
    </div>
  );
};