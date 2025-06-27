export class SigningService {
  static async applyDigitalSignature(instance: any): Promise<Blob> {
    const doc = await instance.exportPDF();
    const pdfBlob = new Blob([doc], { type: "application/pdf" });
    const imageBlob = await this.imageToBlob(
      `${window.location.protocol}//${window.location.host}/signed/logo.png`
    );
    
    const formData = new FormData();
    formData.append('file', pdfBlob);
    formData.append('image', imageBlob);
    
    const response = await fetch('./api/digitalSigningLite', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to apply digital signature');
    }
    
    return await response.blob();
  }

  static async getCertificates() {
    const response = await fetch('/api/digitalSigningLite', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch certificates');
    }
    
    return await response.json();
  }

  private static async imageToBlob(imageUrl: string): Promise<Blob> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    return await response.blob();
  }
}