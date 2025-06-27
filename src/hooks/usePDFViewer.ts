import { useState, useEffect, useRef } from 'react';
import { PDFViewerState, User, AnnotationTypeEnum } from '../types';
import { createPSPDFKitConfig, createUIConfiguration, TOOLBAR_ITEMS } from '../config/pdfConfig';
import { PDFEventHandlers } from '../services/pdf/eventHandlers';
import { getAnnotationRenderers } from '../services/pdf/renderingService';

export const usePDFViewer = (
  containerRef: React.RefObject<HTMLDivElement>,
  pdfUrl: string,
  currentUser: User,
  currentSignee: User,
  onPageChange: (page: number) => void
) => {
  const [viewerState, setViewerState] = useState<PDFViewerState>({
    instance: null,
    currentPageIndex: 0,
    isReady: false,
    pdfUrl
  });

  const [PSPDFKit, setPSPDFKit] = useState<any>(null);
  const [sessionSignatures, setSessionSignatures] = useState<any[]>([]);
  const [sessionInitials, setSessionInitials] = useState<any[]>([]);
  const [isCreateInitial, setIsCreateInitial] = useState(false);
  const [digitallySigned, setDigitallySigned] = useState<any>(null);
  const [signatureAnnotationIds, setSignatureAnnotationIds] = useState<string[]>([]);

  const mySignatureIdsRef = useRef<string[]>([]);
  const digitallySignedRef = useRef<any>(null);

  const currSigneeRef = useRef(currentSignee);
  const currUserRef = useRef(currentUser);
  const onPageIndexRef = useRef(0);
  const isTextAnnotationMovableRef = useRef(false);
  const isCreateInitialRef = useRef(false);

  currSigneeRef.current = currentSignee;
  currUserRef.current = currentUser;
  onPageIndexRef.current = viewerState.currentPageIndex;
  isCreateInitialRef.current = isCreateInitial;
  digitallySignedRef.current = digitallySigned;

  useEffect(() => {
    const loadPSPDFKit = async () => {
      if (!containerRef.current) return;

      const PSPDFKitModule = await import("@nutrient-sdk/viewer");
      setPSPDFKit(PSPDFKitModule);

      if (PSPDFKitModule && containerRef.current) {
        try {
          PSPDFKitModule.default.unload(containerRef.current);
        } catch (e) {
          // Container might not have PSPDFKit loaded yet
        }
      }

      const config = createPSPDFKitConfig(
        containerRef.current,
        pdfUrl,
        process.env.NEXT_PUBLIC_LICENSE_KEY as string,
        {
          Annotation: ({ annotation }: any) => {
            // Handle digitally signed documents - hide custom renderer for signed DS fields
            if (digitallySignedRef.current && annotation.customData?.type === AnnotationTypeEnum.DS) {
              const isFieldSigned = digitallySignedRef.current.signatures.find(
                (sign: any) => sign.signatureFormFQN === annotation.formFieldName
              );
              if (isFieldSigned) {
                const ele = document.createElement('div');
                return { node: ele, append: true };
              }
            }
            
            // Handle custom annotation renderers for initials, signatures, etc.
            return getAnnotationRenderers({ annotation });
          }
        },
        TOOLBAR_ITEMS // Explicitly pass toolbar items only
      );

      // Add UI configuration for CreateSignature interface before loading
      config.ui = createUIConfiguration()(PSPDFKitModule.default);

      try {
        const instance = await PSPDFKitModule.default.load(config);
        
        // Get digital signature info first
        const info = await instance.getSignaturesInfo();
        if (info.status) {
          setDigitallySigned(info);
          digitallySignedRef.current = info; // Update the ref for the custom renderer
        }

        // Setup event handlers
        PDFEventHandlers.setupDropHandler(
          instance,
          PSPDFKitModule.default,
          currSigneeRef,
          currUserRef,
          onPageIndexRef
        );

        PDFEventHandlers.setupPageChangeHandler(instance, (page) => {
          setViewerState(prev => ({ ...prev, currentPageIndex: page }));
          onPageChange(page);
        });

        // Setup annotation lifecycle handlers for custom renderers
        PDFEventHandlers.setupAnnotationLifecycleHandlers(
          instance,
          mySignatureIdsRef,
          setSignatureAnnotationIds,
          currentUser
        );

        // Setup annotation press handler for signature interactions
        PDFEventHandlers.setupAnnotationPressHandler(
          instance,
          PSPDFKitModule.default,
          sessionSignatures,
          sessionInitials,
          setIsCreateInitial,
          isTextAnnotationMovableRef
        );

        // Setup stored signature handler for signature creation
        PDFEventHandlers.setupStoredSignatureHandler(
          instance,
          sessionSignatures,
          sessionInitials,
          setSessionSignatures,
          setSessionInitials,
          isCreateInitialRef
        );

        // Add form-creator toolbar item
        instance.setToolbarItems((items: any) => [
          ...items,
          { type: "form-creator" },
        ]);

        // Set signature validation status
        await instance.setViewState((viewState: any) => 
          viewState.set("showSignatureValidationStatus", PSPDFKitModule.default.ShowSignatureValidationStatusMode.IF_SIGNED)
        );

        // Set initial toolbar visibility and interaction mode based on user role
        const shouldShowToolbar = currentUser.role === "Editor";
        const interactionMode = currentUser.role === "Editor" 
          ? PSPDFKitModule.default.InteractionMode.FORM_CREATOR 
          : PSPDFKitModule.default.InteractionMode.PAN;
          
        await instance.setViewState((viewState: any) => 
          viewState
            .set("showToolbar", shouldShowToolbar)
            .set("interactionMode", interactionMode)
        );

        setViewerState(prev => ({
          ...prev,
          instance,
          isReady: true
        }));

      } catch (error) {
        console.error('Failed to load PSPDFKit:', error);
      }
    };

    loadPSPDFKit();
  }, [pdfUrl, containerRef]);

  const updatePdfUrl = (newUrl: string) => {
    setViewerState(prev => ({ ...prev, pdfUrl: newUrl }));
  };

  return {
    viewerState,
    PSPDFKit,
    sessionSignatures,
    sessionInitials,
    setSessionSignatures,
    setSessionInitials,
    isCreateInitial,
    setIsCreateInitial,
    digitallySigned,
    updatePdfUrl,
    isTextAnnotationMovableRef,
    signatureAnnotationIds,
    mySignatureIdsRef
  };
};