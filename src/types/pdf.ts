export interface PDFViewerState {
  instance: any | null;
  currentPageIndex: number;
  isReady: boolean;
  pdfUrl: string;
}

export interface SigningSession {
  signatures: any[];
  initials: any[];
  isReadyToSign: boolean;
  digitallySigned: any | null;
}

