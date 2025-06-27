export const TOOLBAR_ITEMS = [
  { type: "sidebar-thumbnails" },
  { type: "sidebar-document-outline" },
  { type: "sidebar-annotations" },
  { type : "sidebar-signatures" },
  { type: "pager" },
  { type: "layout-config" },
  { type: "pan" },
  { type: "zoom-out" },
  { type: "zoom-in" },
  { type: "search" },
  { type: "spacer" },
  { type: "print" },
  { type: "export-pdf" },
];

export const createPSPDFKitConfig = (
  container: HTMLElement,
  pdfUrl: string,
  licenseKey: string,
  customRenderers: any,
  toolbarItems: any[] = TOOLBAR_ITEMS
) => {
  const config: any = {
    licenseKey,
    container,
    document: pdfUrl,
    baseUrl: `${window.location.protocol}//${window.location.host}/nutrient-viewer/`,
    toolbarItems,
    disableTextSelection: true,
    customRenderers,
    styleSheets: [`/viewer.css`],
    isEditableAnnotation: (annotation: any) => !annotation.isSignature,
    trustedCAsCallback: async () => {
      let arrayBuffer: String[] = [];
      try {
        const response = await fetch('/api/digitalSigningLite', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const apiRes = await response.json();
        apiRes.data.data.ca_certificates.forEach((cert: string) => {
          arrayBuffer.push(atob(cert));
        });
      } catch (e) {
        throw `Error ${e}`;
      }
      return [...arrayBuffer];
    }
  };

  return config;
};

// Global state to track the last clicked annotation type
let globalLastClickedAnnotationType: string = 'signature';

export const setGlobalAnnotationType = (type: string) => {
  globalLastClickedAnnotationType = type;
};

export const createUIConfiguration = () => {
  return (PSPDFKit: any) => {
    const { UI: { createBlock, Recipes, Interfaces } } = PSPDFKit;
    
    return {
      [Interfaces.CreateSignature]: ({ props }: any) => {
        return {
          content: createBlock(
            Recipes.CreateSignature,
            props,
            ({ ui }: any) => {
              // Check the global state for the most recent annotation type
              const isCreateInitial = globalLastClickedAnnotationType === 'initial';
              
              if (isCreateInitial) {
                ui.getBlockById("title").children = "Create Initial";
                ui.getBlockById("save-signature-checkbox")._props.label = "Save Initial";

                const textInput = ui.getBlockById("signature-text-input");
                textInput._props.placeholder = "Initial";
                textInput._props.label = "Initial here";
                textInput._props.clearLabel = "Clear initial";

                const freehand = ui.getBlockById("freehand-canvas");
                freehand._props.placeholder = "Initial here";
                freehand._props.clearLabel = "Clear initial";

                const fontselect = ui.getBlockById("font-selector");
                if (fontselect._props.items[0].label === "Signature") {
                  fontselect._props.items = fontselect._props.items.map((item: any) => {
                    return { id: item.id, label: "Initial" };
                  });
                }
              }
              return ui.createComponent();
            }
          ).createComponent(),
        };
      }
    };
  };
};