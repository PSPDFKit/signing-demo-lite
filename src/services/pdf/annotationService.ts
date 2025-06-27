import { AnnotationTypeEnum, SignatureAnnotation, User } from '../../types';
import { ANNOTATION_SIZES, RESIZE_CONSTRAINTS } from '../../config/constants';

export class AnnotationService {
  static async createSignatureAnnotation(
    PSPDFKit: any,
    instance: any,
    {
      pageRect,
      instantId,
      pageIndex,
      user,
      signee,
      email,
      annotationType
    }: {
      pageRect: any;
      instantId: string;
      pageIndex: number;
      user: User;
      signee: User;
      email: string;
      annotationType: AnnotationTypeEnum;
    }
  ) {
    const widget = new PSPDFKit.Annotations.WidgetAnnotation({
      boundingBox: pageRect,
      formFieldName: annotationType === AnnotationTypeEnum.DS ? "DigitalSignature" : instantId,
      id: instantId,
      pageIndex,
      name: instantId,
      customData: {
        createdBy: user.id,
        signerID: annotationType === AnnotationTypeEnum.DS ? user.id : signee.id,
        signerEmail: email,
        type: annotationType,
        signerColor: annotationType === AnnotationTypeEnum.DS ? PSPDFKit.Color.WHITE : signee.color,
        isInitial: annotationType === AnnotationTypeEnum.INITIAL,
      },
      backgroundColor: PSPDFKit.Color.TRANSPARENT,
      borderWidth: 0
    });

    const formField = new PSPDFKit.FormFields.SignatureFormField({
      annotationIds: PSPDFKit.Immutable.List([widget.id]),
      name: annotationType === AnnotationTypeEnum.DS ? 'DigitalSignature' : instantId,
      id: instantId,
      readOnly: signee.id != user.id,
    });

    return await instance.create([widget, formField]);
  }

  static async createTextAnnotation(
    PSPDFKit: any,
    instance: any,
    {
      pageRect,
      pageIndex,
      annotationType,
      name,
      email,
      signee
    }: {
      pageRect: any;
      pageIndex: number;
      annotationType: string;
      name: string;
      email: string;
      signee: User;
    }
  ) {
    const text = new PSPDFKit.Annotations.TextAnnotation({
      pageIndex,
      boundingBox: pageRect,
      text: {
        format: "plain",
        value: annotationType === "name" ? name : new Date().toDateString(),
      },
      name: name,
      customData: {
        signerEmail: email,
        type: annotationType,
        signerColor: signee.color,
      },
      font: "Helvetica",
      fontSize: 14,
      horizontalAlign: "center",
      verticalAlign: "center",
      isEditable: false,
      backgroundColor: signee.color,
    });

    return await instance.create(text);
  }

  static getAnnotationSize(annotationType: AnnotationTypeEnum) {
    switch (annotationType) {
      case AnnotationTypeEnum.INITIAL:
        return ANNOTATION_SIZES.INITIAL;
      case AnnotationTypeEnum.SIGNATURE:
        return ANNOTATION_SIZES.SIGNATURE;
      case AnnotationTypeEnum.DS:
        return ANNOTATION_SIZES.DS;
      default:
        return ANNOTATION_SIZES.DEFAULT;
    }
  }

  static setupResizeConstraints(instance: any, PSPDFKit: any) {
    instance.setOnAnnotationResizeStart((eve: any) => {
      if (eve.annotation instanceof PSPDFKit.Annotations.WidgetAnnotation ||
          eve.annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
        return {
          maxWidth: RESIZE_CONSTRAINTS.MAX_WIDTH,
          maxHeight: RESIZE_CONSTRAINTS.MAX_HEIGHT,
          minWidth: RESIZE_CONSTRAINTS.MIN_WIDTH,
          minHeight: RESIZE_CONSTRAINTS.MIN_HEIGHT,
        };
      }
    });
  }
}