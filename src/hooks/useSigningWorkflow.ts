import { useState } from 'react';
import { User } from '../types';
import { randomColor } from '../utils/colorUtils';
import { SigningService } from '../services/api/signingService';
import { getOrCreateUser } from '../utils/userUtils';

export const useSigningWorkflow = (
  initialUsers: User[],
  initialUser: User,
  PSPDFKit: any
) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [currentSignee, setCurrentSignee] = useState<User>(
    users.find((user) => user.role !== "Editor") || initialUser
  );
  const [selectedSignee, setSelectedSignee] = useState<User>(currentSignee);
  const [isVisible, setIsVisible] = useState(currentUser.role === "Editor");
  const [readyToSign, setReadyToSign] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const addSignee = () => {
    if (typeof window === "undefined") return;

    const name = window.prompt("Enter signee's name:");
    const email = window.prompt("Enter signee's email:");

    if (!name || !email) {
      alert("Please enter both name and email.");
      return;
    }

    const newUser = getOrCreateUser(
      name,
      email,
      users,
      PSPDFKit,
      randomColor
    );

    // Only add if user doesn't already exist
    if (!users.find(user => user.id === newUser.id)) {
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
  };

  const deleteUser = (user: User) => {
    // Check if this is a signer/signee (not an Editor)
    if (user.role !== "Editor") {
      // Count remaining signers after potential deletion
      const remainingSigners = users.filter((u) => u.id !== user.id && u.role !== "Editor");
      
      // Prevent deletion if this would be the last signer
      if (remainingSigners.length === 0) {
        alert("Cannot delete the last signer. At least one signer must remain.");
        return;
      }
    }

    const remainingUsers = users.filter((u) => u.id !== user.id);
    const nextSignee = remainingUsers.find((u) => u.role !== "Editor");
    
    setUsers(remainingUsers);
    
    if (nextSignee) {
      setCurrentSignee(nextSignee);
      setSelectedSignee(nextSignee);
    } else {
      // This should not happen now due to the validation above
      alert("No Signee left");
    }
  };

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
      return field.set("readOnly", !isUserField);
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
  };

  const applyDigitalSignature = async (instance: any, containerRef: React.RefObject<HTMLDivElement>) => {
    setIsLoading(true);
    try {
      const signedPdfBlob = await SigningService.applyDigitalSignature(instance);
      
      if (containerRef.current) {
        const newPdfUrl = URL.createObjectURL(signedPdfBlob);
        return newPdfUrl;
      }
    } catch (error) {
      console.error('Error in digital signing:', error);
      alert("Error in signing");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    currentUser,
    currentSignee,
    selectedSignee,
    isVisible,
    readyToSign,
    isLoading,
    setCurrentSignee,
    setSelectedSignee,
    setReadyToSign,
    addSignee,
    deleteUser,
    changeUser,
    applyDigitalSignature
  };
};