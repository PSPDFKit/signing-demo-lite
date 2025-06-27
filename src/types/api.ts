export interface AIMessage {
  role: string;
  content: string;
}

export interface DigitalSigningRequest {
  file: Blob;
  image: Blob;
  signatureType?: string;
  flatten?: boolean;
  cadesLevel?: string;
  formFieldName?: string;
}

export interface DigitalSigningResponse {
  success: boolean;
  fileName?: string;
  error?: string;
}

export interface CertificateResponse {
  data: {
    ca_certificates: string[];
  };
}