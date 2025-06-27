import React, { useRef } from 'react';
import { ActionButton } from '@baseline-ui/core';
import { sidebarStyles } from '../../styles/sidebarStyles';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  currentFileName: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  currentFileName,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else {
      alert('Please select a valid PDF file.');
    }
    // Reset the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={sidebarStyles.section}>
      <h3 style={sidebarStyles.sectionTitle}>
        Document
      </h3>
      
      <div style={sidebarStyles.sectionDescription}>
        Try with your own PDF document or use the sample document provided. <br /> <br />
        <span style={sidebarStyles.highlight}>Selected Document : {currentFileName}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <ActionButton
        label="Upload PDF"
        variant="secondary"
        size="sm"
        onClick={handleButtonClick}
        isDisabled={disabled}
        style={{ width: '100%' }}
      />
    </div>
  );
};