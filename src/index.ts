// Components
export { default as SigningDemo } from './components/SigningDemo';
export { UserSelector } from './components/signing/UserSelector';
export { SigneeManager } from './components/signing/SigneeManager';
export { FieldPanel } from './components/signing/FieldPanel';
export { DraggableField } from './components/signing/DraggableField';
export { ColorCircle } from './components/ui/ColorCircle';
export { FileUpload } from './components/ui/FileUpload';
export { Sidebar } from './components/layout/Sidebar';

// Services
export { AnnotationService } from './services/pdf/annotationService';
export { PDFEventHandlers } from './services/pdf/eventHandlers';
export { SigningService } from './services/api/signingService';
export { AIService } from './services/api/aiService';
export * from './services/pdf/renderingService';

// Hooks
export { usePDFViewer } from './hooks/usePDFViewer';
export { useSigningWorkflow } from './hooks/useSigningWorkflow';

// Types
export * from './types';

// Utils
export * from './utils/colorUtils';
export * from './utils/icons';
export * from './utils/userUtils';

// Config
export * from './config/constants';
export * from './config/pdfConfig';

// Styles
export * from './styles/sidebarStyles';