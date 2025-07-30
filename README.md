# Nutrient Web SDK Signing Workflow Demo

A comprehensive demonstration of document signing workflows using Nutrient's Web SDK (formerly PSPDFKit). This project showcases electronic signatures, initials, digital signatures, and advanced PDF form creation capabilities.

## Disclaimer
This repository contains sample PDF signing workflow built with Nutrient Web SDK. This sample is not officially supported, which means this may stop working and not be fixed, but exist to serve for inspiration. Read the [disclaimer](https://github.com/PSPDFKit/awesome-nutrient/blob/master/DISCLAIMER.md) or [reach out](https://support.nutrient.io/hc/en-us/requests/new) if you have questions.

## Overview

This demo demonstrates how to implement a complete signing workflow with Nutrient's Web SDK, featuring:

- **Electronic Signatures & Initials**: Visual signature fields with custom renderers
- **Digital Signatures**: Cryptographic PDF signing with certificate validation
- **Multi-User Workflows**: Role-based permissions and signee management
- **Custom UI**: Tailored interfaces using Nutrient's configuration options
- **Drag & Drop**: Intuitive field placement on PDF documents
- **Form Creator Mode**: Advanced form field management capabilities

## Quick Start

### Hosted
https://signing-demo-baseline-one.vercel.app/

### Prerequisites to run locally
- Node.js 16+ and npm
- Nutrient Web SDK license key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PSPDFKit/signing-demo-lite
   cd signing-demo-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy Nutrient assets**
   ```bash
   cp -R ./node_modules/@nutrient-sdk/viewer/dist/nutrient-viewer public/
   ```

4. **Set up environment variables**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_LICENSE_KEY=your_license_key_here
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

## Implementation Guide

### 1. PDF Viewer Setup

The Viewer enables users to load and display documents within the web application. In this step, we'll also customize the appearance of signature widgets and configure initial signature fields.

```javascript
// Basic configuration for signing workflow
const config = {
  licenseKey: "YOUR_LICENSE_KEY",
  container: document.getElementById("pdfviewer"),
  document: "/path/to/document.pdf",
  baseUrl: "/nutrient-viewer/",
  
  // Enable custom renderers for signature fields
  customRenderers: {
    Annotation: ({ annotation }) => {
      // You can use annotation's customData property to determine if this is an initial, digital signature or just a normal signature and customise the UI accordingly
      return getCustomSignatureRenderer(annotation);
    }
  },
  
  // Configure toolbar for form creation
  toolbarItems: [
    { type: "sidebar-thumbnails" },
    { type: "sidebar-document-outline" },
    { type: "spacer" },
    { type: "zoom-out" },
    { type: "zoom-in" },
    { type: "zoom-mode" },
    { type: "spacer" },
    { type: "pan" },
    { type: "spacer" },
    { type: "undo" },
    { type: "redo" }
  ],

  ui: {
    [Nutrient.Interfaces.CreateSignature]: ({ props }) => {
      return {
        content: Nutrient.Recipes.CreateSignature(props, ({ ui }) => {
          const isCreateInitial = globalLastClickedAnnotationType === 'initial'; // Use globalLastClickedAnnotationType to track whether the clicked field is initial or signature. More info on Step 6
          
          if (isCreateInitial) {
            // Customize for initial creation
            ui.getBlockById("title").children = "Create Initial";
            ui.getBlockById("save-signature-checkbox")._props.label = "Save Initial";
            ui.getBlockById("save-signature-checkbox")._props.defaultChecked = false;
            
            // Style adjustments for smaller initials
            const drawBlock = ui.getBlockById("draw");
            if (drawBlock) {
              drawBlock._props.style = { 
                ...drawBlock._props.style, 
                height: "150px" 
              };
            }
          }
          
          return ui.createComponent();
        }).createComponent()
      };
    }
  },

  // By implementing this callback you have a fine grained control over which certificates are going to be used for digital signatures validation.
  trustedCAsCallback: async () => {
    try {
      // Fetch CA certificates from your backend
      const response = await fetch('/api/ca-certificates');
      const certificates = await response.json();
      
      // Return decoded certificates
      return certificates.ca_certificates.map(cert => atob(cert));
    } catch (error) {
      console.error('Failed to load CA certificates:', error);
      return [];
    }
  }
};

const instance = await Nutrient.load(config);
```
#### Relevant Guides
- https://www.nutrient.io/sdk/web/getting-started/
- https://www.nutrient.io/guides/web/annotations/custom-rendered-annotations/#h1-annotation-customization
- https://www.nutrient.io/guides/web/customizing-the-interface/customizing-the-toolbar/
- https://www.nutrient.io/api/web/PSPDFKit.Configuration.html#trustedCAsCallback

### 2. Creating Signature Fields

#### Electronic Signature Fields
Electronic signatures are annotations added directly onto the document. They can be hand-drawn, uploaded as an image, or typed using the signature creation modal.

```javascript
async function createSignatureField(instance, Nutrient, options) {
  const { pageRect, pageIndex, signee, fieldType } = options;
  
  // Create widget annotation for visual representation
  const widget = new Nutrient.Annotations.WidgetAnnotation({
    boundingBox: pageRect,
    formFieldName: generateUniqueId(),
    customData: {
      signerID: signee.id,
      signerEmail: signee.email,
      type: fieldType, // 'signature', 'initial', or 'digital-signature'
      signerColor: signee.color,
      createdBy: currentUser.id
      // You can add more relevant properties if needed
    }
  });

  // Create form field for functionality
  const formField = new Nutrient.FormFields.SignatureFormField({
    name: widget.formFieldName,
    annotationIds: Nutrient.Immutable.List([widget.id]),
    readOnly: signee.id !== currentUser.id // Enforce permissions
  });

  // Add to document
  await instance.create([widget, formField]);
}
```

#### Digital Signature Fields
Digital signatures are cryptographic signatures applied to documents to verify their authenticity and ensure their integrity. They're commonly used in legally binding contracts. In this step, we'll create a form field to place visible digital signatures on the document.

```javascript
async function createDigitalSignatureField(instance, Nutrient, options) {
  const { pageRect, pageIndex } = options;
  
  const widget = new Nutrient.Annotations.WidgetAnnotation({
    boundingBox: pageRect,
    formFieldName: "DigitalSignature", // Fixed name for digital signatures
    customData: {
      type: "digital-signature",
    }
  });

  const formField = new Nutrient.FormFields.SignatureFormField({
    name: "DigitalSignature",
    annotationIds: Nutrient.Immutable.List([widget.id])
  });

  await instance.create([widget, formField]);
}
```

#### Relevant Guides
- https://www.nutrient.io/guides/web/forms/create-edit-and-remove/add-signature-field/


### 3. Implementing Drag & Drop

#### HTML Structure for Draggable Fields
In this step, we'll define the HTML structure for creating a side panel UI, which will contain draggable elements.

```html
<div class="field-panel">
  <div class="field-item" 
       draggable="true" 
       onDragStart="handleDragStart(event, 'signature')">
    <span>Signature</span>
    <svg><!-- signature icon --></svg>
  </div>
  
  <div class="field-item" 
       draggable="true" 
       onDragStart="handleDragStart(event, 'initial')">
    <span>Initial</span>
    <svg><!-- initial icon --></svg>
  </div>
  
  <div class="field-item" 
       draggable="true" 
       onDragStart="handleDragStart(event, 'digital-signature')">
    <span>Digital Signature</span>
    <svg><!-- certificate icon --></svg>
  </div>
</div>
```

#### JavaScript Drag & Drop Implementation
In this step, we'll implement the logic to detect when form fields are dropped into the document viewer and dynamically create the corresponding form fields on the document.

```javascript
function handleDragStart(event, fieldType) {
  // Prepare data for drop
  const dragData = {
    signeeName: currentSignee.name,
    signeeEmail: currentSignee.email,
    fieldType: fieldType,
    fieldId: generateUniqueId()
  };
  
  event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = "move";
  
  // Visual feedback
  event.target.style.opacity = "0.6";
}

// Set up drop handler on PDF viewer
instance.addEventListener("viewState.currentPageIndex.change", () => {
  setupDropHandler(instance);
});

function setupDropHandler(instance) {
  const viewerElement = instance.contentDocument.body;
  
  viewerElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  
  viewerElement.addEventListener("drop", async (e) => {
    e.preventDefault();
    
    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    const pageIndex = await instance.getViewState().currentPageIndex;
    
    // Convert client coordinates to PDF coordinates
    const clientRect = new DOMRect(e.clientX - 50, e.clientY - 25, 100, 50);
    const pageRect = instance.transformContentClientToPageSpace(clientRect, pageIndex);
    
    // Create the appropriate field type
    await createSignatureField(instance, Nutrient, {
      pageRect,
      pageIndex,
      signee: findSigneeByEmail(dragData.signeeEmail),
      fieldType: dragData.fieldType
    });
  });
}
```

#### Relevant Guides
- https://www.nutrient.io/guides/web/customizing-the-interface/observing-changes-with-events/

### 4. User Management & Permissions
This implementation demonstrates user management with role-based permissions, where each user object contains identification data (id, name, email) and a role that determines their capabilities - such as creating signature fields or signing specific fields assigned to them.

```javascript
class SigningWorkflow {
  constructor() {
    this.users = [
      { id: 1, name: "Admin", email: "admin@example.com", role: "Editor" },
      { id: 2, name: "Signer 1", email: "signer1@example.com", role: "Signer" }
    ];
    this.currentUser = this.users[0];
    this.currentSignee = this.users[1];
  }
  
  addSignee(name, email) {
    const newUser = {
      id: Date.now(),
      name,
      email,
      role: "Signer",
      color: this.generateRandomColor()
    };
    
    this.users.push(newUser);
    return newUser;
  }
  
  deleteUser(userId) {
    // Ensure at least one signer remains
    const signers = this.users.filter(u => u.role === "Signer");
    if (signers.length <= 1 && signers[0]?.id === userId) {
      throw new Error("At least one signer must remain");
    }
    
    this.users = this.users.filter(u => u.id !== userId);
  }
  
  const changeUser = async (user: User, instance: any) => {
    setCurrentUser(user);
    
    if (!instance) return;

    const formFields = await instance.getFormFields();
    const signatureFormFields = formFields.filter(
      (field: any) => field instanceof PSPDFKit.FormFields.SignatureFormField
    );

    // Get user's signature annotations
    const userAnnotations: string[] = [];
    for (let i = 0; i < instance.totalPageCount; i++) {
      const annotations = await instance.getAnnotations(i);
      annotations.forEach((annotation: any) => {
        if (annotation.customData?.signerID === user.id) {
          userAnnotations.push(annotation.id);
        }
      });
    }

    // Update form field read-only status
    const updatedFormFields = signatureFormFields.map((field: any) => {
      const isUserField = userAnnotations.includes(field.id);
      return field.set("readOnly", !isUserField); // You can use other properties like noView to hide non user signing fields
    });

    await instance.update(updatedFormFields);

    // Set UI state based on user role
    if (user.role === "Editor") {
      instance.setViewState((viewState: any) =>
        viewState
          .set("showToolbar", true)
          .set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR)
      );
      setIsVisible(true);
      setReadyToSign(false);
    } else {
      instance.setViewState((viewState: any) =>
        viewState
          .set("showToolbar", false)
          .set("interactionMode", PSPDFKit.InteractionMode.PAN)
      );
      setIsVisible(false);
      setReadyToSign(true);
    }
  }
}
```

#### Relevant Guides
- https://www.nutrient.io/guides/web/forms/create-edit-and-remove/form-field-flags/
- https://www.nutrient.io/guides/web/customizing-the-interface/viewstate/
- https://www.nutrient.io/guides/web/forms/create-edit-and-remove/edit-fields/



### 5. Digital Signature Implementation

#### Digital Signing
This step demonstrates how to digitally sign PDF documents to ensure security and verify document integrity against tampering. This implementation uses Nutrient's API, which provides SOC 2-compliant digital signatures for integration into apps, websites, and platforms. The API enables easy signing, management, and validation of legally binding documents. Alternatively, you can use your own signing service with custom certificates through Nutrient Web SDK - relevant guides are provided in the section below.

```javascript
async function applyDigitalSignature(instance) {
  try {
    // Export current PDF state
    const pdfDocument = await instance.exportPDF();
    
    // Create form data for API request
    const formData = new FormData();
    formData.append('pdf', new Blob([pdfDocument], { type: 'application/pdf' }));
    formData.append('signature_config', JSON.stringify({
      signature_type: "cades",
      cades_level: "b-lt",
      signature_appearance_mode: "signature_and_description",
      form_field_name: "DigitalSignature" // This name should be same as the name of the form field allocated for visible digital signing. In absence of a form field with this name, an invisble digital signature will be applied to the document.
    }));
    
    // Use a backend to send this request to Nutrient Document Web Services API
    const response = await fetch('https://api.nutrient.io/sign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Digital signing failed: ${response.statusText}`);
    }
    
    // Get signed PDF blob
    const signedPdfBlob = await response.blob();
    return signedPdfBlob; // You can pass this blob in document property to view the digitally signed pdf
    
  } catch (error) {
    console.error('Digital signature error:', error);
    throw error;
  }
}
```

#### Certificate Validation Setup
This configuration displays the validation status of digitally signed documents. The validation indicator appears only when a document contains digital signatures and shows their current verification status.

```javascript
// Set signature validation display
await instance.setViewState(viewState => 
  viewState.set("showSignatureValidationStatus", 
    Nutrient.ShowSignatureValidationStatusMode.IF_SIGNED
  )
);
```

#### Relevant Guides
- https://www.nutrient.io/api/digital-signatures-api/
- https://www.nutrient.io/guides/web/user-interface/signatures/validation-status/
- https://www.nutrient.io/blog/how-to-add-a-digital-signature-to-pdf-using-laravel/#adding-a-digital-signature-to-a-pdf-using-nutrient
- https://www.nutrient.io/guides/document-engine/signatures/signature-lifecycle/sign-a-pdf-document/#the-signing-service
- https://www.nutrient.io/guides/web/signatures/digital-signatures/integrations/aws-hsm/#setting-up-the-signing-server
- https://www.nutrient.io/blog/how-to-integrate-aws-cloudhsm-to-sign-documents/#producing-a-digital-signature



### 6. Event Handling
This section implements event handlers to distinguish between signature and initial field interactions, enabling different behaviors based on the field type clicked.

```javascript    
// Handle signature interactions
instance.addEventListener("annotations.press", (annotation) => {
  if (annotation.customData?.type === "signature") {
    globalLastClickedAnnotationType = 'signature';
  } else if (annotation.customData?.type === "initial") {
    globalLastClickedAnnotationType = 'initial';
  }
});
```

#### Relevant Guides
- https://www.nutrient.io/guides/web/annotations/custom-data-in-annotations/
- https://www.nutrient.io/api/web/NutrientViewer.AnnotationsPressEvent.html

### 7. File Upload & Management

```javascript
function setupFileUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf';
  
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate PDF file
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    
    // Create object URL for new PDF
    const newPdfUrl = URL.createObjectURL(file);
    
    // Reload viewer with new document
    await reloadPDFViewer(newPdfUrl);
    
    // Clean up previous URL to prevent memory leaks
    URL.revokeObjectURL(previousPdfUrl);
  });
}

async function reloadPDFViewer(newPdfUrl) {
  // Unload existing instance
  if (instance) {
    Nutrient.unload(container);
  }
  
  // Load new document
  const config = createPDFConfig(newPdfUrl);
  instance = await Nutrient.load(config);
  
  // Re-setup event handlers
  PDFEventHandlers.setupAnnotationHandlers(instance);
}
```

#### Relevant Guides
- https://www.nutrient.io/sdk/web/getting-started/

## Advanced Features

### Signature Persistence

```javascript
// Save signature/initial for reuse
instance.addEventListener("storedSignature.create", (storedSignature) => {
  const isInitial = globalLastClickedAnnotationType === 'initial';
  const signatures = isInitial ? sessionInitials : sessionSignatures;
  
  signatures.push(storedSignature);
  localStorage.setItem(
    isInitial ? 'saved-initials' : 'saved-signatures', 
    JSON.stringify(signatures)
  );
});

// Load saved signatures on startup
function loadSavedSignatures() {
  const savedSignatures = localStorage.getItem('saved-signatures');
  const savedInitials = localStorage.getItem('saved-initials');
  
  if (savedSignatures) {
    sessionSignatures = JSON.parse(savedSignatures);
  }
  
  if (savedInitials) {
    sessionInitials = JSON.parse(savedInitials);
  }
}
```

#### Relevant Guides
- https://www.nutrient.io/guides/web/signatures/signature-storage/



```css
/* Responsive signature field styling */
.signature-field, .initial-field, .digital-signature-field {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 8px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.signature-field:hover,
.initial-field:hover,
.digital-signature-field:hover {
  border-color: #007acc;
  transform: scale(1.02);
}

.signed-field {
  background-color: #f0f9ff !important;
  border-color: #0ea5e9 !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .field-panel {
    flex-direction: column;
    width: 100%;
  }
  
  .signature-field {
    min-height: 40px;
    font-size: 10px;
  }
}
```

## Best Practices

### 1. Security Considerations
- Always validate PDF files before processing
- Use HTTPS for digital signature API calls
- Implement proper user authentication
- Validate certificate chains for digital signatures

### 2. Performance Optimization
- Clean up object URLs to prevent memory leaks
- Use lazy loading for large PDF documents
- Implement efficient state management
- Minimize re-renders with proper event handling

### 3. User Experience
- Provide clear visual feedback for all interactions
- Implement loading states for async operations
- Use consistent color coding for signees
- Ensure accessibility with proper ARIA labels

### 4. Error Handling
```javascript
// Comprehensive error handling
try {
  await createSignatureField(instance, Nutrient, options);
} catch (error) {
  if (error.name === 'LicenseError') {
    showError('License validation failed. Please check your license key.');
  } else if (error.name === 'PermissionError') {
    showError('You do not have permission to add signature fields.');
  } else {
    showError('Failed to create signature field. Please try again.');
  }
  
  console.error('Signature field creation error:', error);
}
```

## API Reference

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `licenseKey` | string | Your Nutrient Web SDK license key |
| `container` | HTMLElement | DOM element to mount the viewer |
| `document` | string | Path to PDF document or base 64 string or blob |
| `customRenderers` | object | Custom annotation renderers |
| `toolbarItems` | array | Toolbar configuration |
| `ui` | object | Custom UI configurations |
| `trustedCAsCallback` | function | Certificate authority loader |

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `annotations.create` | Annotation created | Array of annotations |
| `annotations.delete` | Annotation deleted | Array of annotations |
| `annotations.press` | Annotation clicked | Single annotation |
| `storedSignature.create` | Signature saved | Stored signature object |

### Field Types

| Type | Description | Use Case |
|------|-------------|----------|
| `signature` | Electronic signature | Wet signature replacement |
| `initial` | Electronic initial | Document acknowledgment |
| `digital-signature` | Cryptographic signature | Legal document signing |

## Troubleshooting

### Common Issues

1. **License Key Errors**
   - Verify your license key is valid
   - Check domain restrictions
   - Ensure proper environment variable setup

2. **Custom Renderers Not Appearing**
   - Verify annotation has required `customData`
   - Check CSS styling and positioning
   - Ensure renderer returns proper object structure

3. **Digital Signature Failures**
   - Verify API credentials
   - Check network connectivity
   - Ensure PDF has digital signature field

4. **Drag & Drop Not Working**
   - Verify event handlers are properly attached
   - Check coordinate transformation logic
   - Ensure proper permission settings

## Resources

- [Nutrient Web SDK Documentation](https://www.nutrient.io/guides/web/)
- [Nutrient Web SDK API Reference](https://www.nutrient.io/api/web/)
- [Digital Signatures Guide](https://www.nutrient.io/api/signing-api/)

## Support

For technical support and questions:
- [Nutrient Developer Support](https://support.nutrient.io/hc/en-us/requests/new)