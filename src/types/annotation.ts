export enum AnnotationTypeEnum {
  NAME = "name",
  SIGNATURE = "signature",
  DATE = "date",
  INITIAL = "initial",
  DS = "ds"
}

export interface AnnotationCustomData {
  createdBy: number;
  signerID: number;
  signerEmail: string;
  type: AnnotationTypeEnum;
  signerColor: any;
  isInitial?: boolean;
}

export interface SignatureAnnotation {
  id: string;
  boundingBox: any;
  customData?: AnnotationCustomData;
  isSignature?: boolean;
  formFieldName?: string;
  pageIndex: number;
}

export interface DraggableFieldProps {
  className: string;
  type: AnnotationTypeEnum;
  label: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  userColor: any;
}