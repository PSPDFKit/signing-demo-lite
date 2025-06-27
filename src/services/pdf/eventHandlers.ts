import { AnnotationService } from './annotationService';
import { AnnotationTypeEnum, User } from '../../types';
import { handleAnnotatitonCreation, handleAnnotatitonDelete } from './renderingService';
import { setGlobalAnnotationType } from '../../config/pdfConfig';

export class PDFEventHandlers {
  static setupDropHandler(
    instance: any,
    PSPDFKit: any,
    currSigneeRef: React.MutableRefObject<User>,
    currUserRef: React.MutableRefObject<User>,
    onPageIndexRef: React.MutableRefObject<number>
  ) {
    const handleDrop = async (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      
      const dataArray = e.dataTransfer.getData("text").split("%");
      let [name, email, instantId, annotationType] = dataArray;
      instantId = PSPDFKit.generateInstantId();
      
      const signee = currSigneeRef.current;
      const user = currUserRef.current;
      const pageIndex = onPageIndexRef.current;
      
      const { width, height } = AnnotationService.getAnnotationSize(annotationType as AnnotationTypeEnum);
      
      const clientRect = new PSPDFKit.Geometry.Rect({
        left: e.clientX - width / 2,
        top: e.clientY - height / 2,
        height,
        width,
      });
      
      const pageRect = instance.transformContentClientToPageSpace(
        clientRect,
        pageIndex
      );

      if (annotationType === AnnotationTypeEnum.SIGNATURE ||
          annotationType === AnnotationTypeEnum.INITIAL ||
          annotationType === AnnotationTypeEnum.DS) {
        await AnnotationService.createSignatureAnnotation(PSPDFKit, instance, {
          pageRect,
          instantId,
          pageIndex,
          user,
          signee,
          email,
          annotationType: annotationType as AnnotationTypeEnum
        });
      } else {
        await AnnotationService.createTextAnnotation(PSPDFKit, instance, {
          pageRect,
          pageIndex,
          annotationType,
          name,
          email,
          signee
        });
      }

      AnnotationService.setupResizeConstraints(instance, PSPDFKit);
    };

    const cont = instance.contentDocument.host;
    cont.ondrop = handleDrop;
  }

  static setupPageChangeHandler(
    instance: any,
    setOnPageIndex: (page: number) => void
  ) {
    instance.addEventListener(
      "viewState.currentPageIndex.change",
      (page: any) => {
        setOnPageIndex(page);
      }
    );
  }

  static setupAnnotationPressHandler(
    instance: any,
    PSPDFKit: any,
    sessionSignatures: any[],
    sessionInitials: any[],
    setIsCreateInitial: (value: boolean) => void,
    isTextAnnotationMovableRef: React.MutableRefObject<boolean>
  ) {
    instance.addEventListener("annotations.press", (event: any) => {
      const lastFormFieldClicked = event.annotation;
      let annotationsToLoad;
      let isCreateInitial = false;

      if (lastFormFieldClicked.customData &&
          lastFormFieldClicked.customData.isInitial === true) {
        annotationsToLoad = sessionInitials;
        isCreateInitial = true;
      } else {
        annotationsToLoad = sessionSignatures;
        isCreateInitial = false;
      }

      // Update global state for UI access
      const annotationType = isCreateInitial ? 'initial' : 'signature';
      setGlobalAnnotationType(annotationType);
      
      // Also store on instance as backup
      instance._lastClickedAnnotationType = annotationType;
      
      // Force state update synchronously
      setIsCreateInitial(isCreateInitial);
      
      instance.setStoredSignatures(
        PSPDFKit.Immutable.List(annotationsToLoad)
      );

      if (!isTextAnnotationMovableRef.current &&
          event.annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
        event.preventDefault();
      }
    });
  }

  static setupStoredSignatureHandler(
    instance: any,
    sessionSignatures: any[],
    sessionInitials: any[],
    setSessionSignatures: (signatures: any[]) => void,
    setSessionInitials: (initials: any[]) => void,
    isCreateInitialRef: React.MutableRefObject<boolean>
  ) {
    instance.addEventListener(
      "storedSignatures.create",
      async (annotation: any) => {
        if (isCreateInitialRef.current) {
          setSessionInitials([...sessionInitials, annotation]);
        } else {
          setSessionSignatures([...sessionSignatures, annotation]);
        }
      }
    );
  }

  static setupAnnotationLifecycleHandlers(
    instance: any,
    mySignatureIdsRef: React.MutableRefObject<string[]>,
    setSignatureAnnotationIds: (ids: string[]) => void,
    currentUser: User
  ) {
    // Handle annotation creation to update custom renderers
    instance.addEventListener("annotations.create", async (createdAnnotations: any[]) => {
      for (const annotation of createdAnnotations) {
        await handleAnnotatitonCreation(
          instance,
          annotation,
          mySignatureIdsRef,
          setSignatureAnnotationIds,
          currentUser.email
        );
      }
    });

    // Handle annotation deletion to clean up custom renderers
    instance.addEventListener("annotations.delete", async (deletedAnnotations: any[]) => {
      for (const annotation of deletedAnnotations) {
        await handleAnnotatitonDelete(
          instance,
          annotation,
          currentUser.email
        );
      }
    });
  }
}