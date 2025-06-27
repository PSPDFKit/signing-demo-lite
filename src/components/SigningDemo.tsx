"use client";
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { User } from "../types";
import { usePDFViewer } from "../hooks/usePDFViewer";
import { useSigningWorkflow } from "../hooks/useSigningWorkflow";
import { ProgressSpinner } from "@baseline-ui/core";
import { Sidebar } from "./layout/Sidebar";
import { PDF_CONFIG } from "../config/constants";
import { randomColor } from "../utils/colorUtils";

interface SigningDemoProps {
  allUsers: User[];
  user: User;
}

const SigningDemo: React.FC<SigningDemoProps> = ({ allUsers, user }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>(PDF_CONFIG.DEFAULT_DOCUMENT);
  const [currentFileName, setCurrentFileName] = useState<string>("document2.pdf");
  const uploadedFileUrlRef = useRef<string | null>(null);

  const [PSPDFKit, setPSPDFKit] = useState<any>(null);
  
  const signingWorkflow = useSigningWorkflow(allUsers, user, PSPDFKit);
  const pdfViewer = usePDFViewer(
    containerRef,
    pdfUrl,
    signingWorkflow.currentUser,
    signingWorkflow.currentSignee,
    () => {} // Page change handler - currently no action needed
  );

  React.useEffect(() => {
    if (pdfViewer.PSPDFKit && !PSPDFKit) {
      setPSPDFKit(pdfViewer.PSPDFKit);
    }
  }, [pdfViewer.PSPDFKit, PSPDFKit]);

  React.useEffect(() => {
    if (PSPDFKit) {
      // Only assign colors to users that don't already have them
      const usedColors = allUsers.map(u => u.color).filter(Boolean);
      
      allUsers.forEach((user) => {
        if (!user.color) {
          user.color = randomColor(PSPDFKit, usedColors);
          usedColors.push(user.color);
        }
      });
    }
  }, [PSPDFKit, allUsers]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, type: string) => {
    const instantId = "PSPDFKit.generateInstantId()";
    const data = [
      signingWorkflow.currentSignee.name,
      signingWorkflow.currentSignee.email,
      instantId,
      type
    ].join("%");

    (event.target as HTMLDivElement).style.opacity = "0.8";
    const img = document.getElementById(`${type}-icon`);
    if (img) {
      event.dataTransfer.setDragImage(img, 10, 10);
    }
    event.dataTransfer.setData("text/plain", data);
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    (event.target as HTMLDivElement).style.opacity = "1";
  };

  const handleUserChange = async (newUser: User) => {
    await signingWorkflow.changeUser(newUser, pdfViewer.viewerState.instance);
  };

  const handleApplyDigitalSignature = async () => {
    try {
      const newPdfUrl = await signingWorkflow.applyDigitalSignature(
        pdfViewer.viewerState.instance,
        containerRef
      );
      if (newPdfUrl) {
        setPdfUrl(newPdfUrl);
        pdfViewer.updatePdfUrl(newPdfUrl);
        setCurrentFileName("signed_document.pdf");
      }
    } catch (error) {
      console.error('Failed to apply digital signature:', error);
    }
  };

  const handleFileUpload = (file: File) => {
    // Clean up previous uploaded file URL to prevent memory leaks
    if (uploadedFileUrlRef.current) {
      URL.revokeObjectURL(uploadedFileUrlRef.current);
    }
    
    const fileUrl = URL.createObjectURL(file);
    uploadedFileUrlRef.current = fileUrl;
    setPdfUrl(fileUrl);
    pdfViewer.updatePdfUrl(fileUrl);
    setCurrentFileName(file.name);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (uploadedFileUrlRef.current) {
        URL.revokeObjectURL(uploadedFileUrlRef.current);
      }
    };
  }, []);

  return (
    <div>
      {signingWorkflow.isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <ProgressSpinner size="md" />
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "top",
          position: "fixed",
          width: "100%",
        }}
      >
        <Sidebar
          users={signingWorkflow.users}
          currentUser={signingWorkflow.currentUser}
          currentSignee={signingWorkflow.currentSignee}
          selectedSignee={signingWorkflow.selectedSignee}
          isVisible={signingWorkflow.isVisible}
          currentFileName={currentFileName}
          isLoading={signingWorkflow.isLoading}
          onUserChange={handleUserChange}
          onSigneeChange={(signee) => {
            signingWorkflow.setCurrentSignee(signee);
            signingWorkflow.setSelectedSignee(signee);
          }}
          onAddSignee={signingWorkflow.addSignee}
          onDeleteUser={signingWorkflow.deleteUser}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onApplyDigitalSignature={handleApplyDigitalSignature}
          onFileUpload={handleFileUpload}
        />
        
        <div
          ref={containerRef}
          onDragOver={(e) => e.preventDefault()}
          style={{
            height: "90vh",
            width: "calc(100% - 256px)",
            borderTop: "1px solid #D7DCE4",
          }}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SigningDemo), { ssr: false });