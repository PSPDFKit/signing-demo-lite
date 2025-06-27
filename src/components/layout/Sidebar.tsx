import React from 'react';
import { User } from '../../types';
import { UserSelector } from '../signing/UserSelector';
import { SigneeManager } from '../signing/SigneeManager';
import { FieldPanel } from '../signing/FieldPanel';
import { FileUpload } from '../ui/FileUpload';

interface SidebarProps {
  users: User[];
  currentUser: User;
  currentSignee: User;
  selectedSignee: User;
  isVisible: boolean;
  currentFileName: string;
  isLoading?: boolean;
  onUserChange: (user: User) => void;
  onSigneeChange: (signee: User) => void;
  onAddSignee: () => void;
  onDeleteUser: (user: User) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onApplyDigitalSignature: () => void;
  onFileUpload: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  users,
  currentUser,
  currentSignee,
  selectedSignee,
  isVisible,
  currentFileName,
  isLoading = false,
  onUserChange,
  onSigneeChange,
  onAddSignee,
  onDeleteUser,
  onDragStart,
  onDragEnd,
  onApplyDigitalSignature,
  onFileUpload
}) => {
  return (
    <div
      style={{
        width: "256px",
        background: "#ffffff",
        borderRight: "1px solid #F0F3F9",
        overflowY: "auto",
        height: "90vh",
        borderTop: "1px solid #D7DCE4",
      }}
    >
      <FileUpload
        onFileUpload={onFileUpload}
        currentFileName={currentFileName}
        disabled={isLoading}
      />
      
      <UserSelector
        users={users}
        currentUser={currentUser}
        onUserChange={onUserChange}
      />
      
      {isVisible && (
        <>
          <SigneeManager
            users={users}
            selectedSignee={selectedSignee}
            onSigneeChange={onSigneeChange}
            onAddSignee={onAddSignee}
            onDeleteUser={onDeleteUser}
          />
          
          <FieldPanel
            currentSignee={currentSignee}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onApplyDigitalSignature={onApplyDigitalSignature}
          />
        </>
      )}
    </div>
  );
};