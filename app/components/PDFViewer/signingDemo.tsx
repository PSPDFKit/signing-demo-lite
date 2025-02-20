"use client";
import { useEffect, useRef, useState } from "react";
import { AnnotationTypeEnum as importedAnnotationTypeEnum, User } from "@/utils/types";
const AnnotationTypeEnum = importedAnnotationTypeEnum;
import { handleAnnotatitonCreation, handleAnnotatitonDelete, TOOLBAR_ITEMS, LoadingSpinner, randomColor, applyDSign } from "../../../utils/helpers";
import { userChange, onPressDuplicate, duplicateAnnotationTooltipCallback } from "./helpers";
import customizeUIForInitials from "./utils/customizeUIForInitials";
import handleDrop from "./utils/dropAnnotations";
import createDynamicSelect from "./utils/popupUserSelect";
import getAnnotationRenderers from "./utils/customAnnotationRenderer";
import addSignee from "./utils/addSignee";
import dynamic from "next/dynamic";
import SidePanel from "../sidePanel/sidePanel";
import { onDragStart } from "../sidePanel/helpers";

/**
 * SignDemo component.
 *
 * @param allUsers - An array of User objects representing all the users.
 * @param user - The currently logged-in user.
 * @returns The rendered SignDemo component.
 */
const SignDemo: React.FC<{ allUsers: User[]; user: User }> = ({ allUsers, user }) => {
  const [PSPDFKit, setPSPDFKit] = useState<any>(null);
  //export const SignDemo: any = ({ allUsers, user }: { allUsers: User[], user: User }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<any>(null);

  // State to store the users. Master is the default user for now who can add fields in the doc.
  const [users, setUsers] = useState<User[]>(allUsers);
  const usersRef = useRef(users);
  usersRef.current = users;

  const [isVisible, setIsVisible] = useState(
    user.role == "Editor" ? true : false
  );

  // State to store the current signee i.e the user who is currently selected for which the field will be added
  //@ts-ignore
  const [currSignee, setCurrSignee] = useState<User>(users.find((user) => user.role !== "Editor"));
  const currSigneeRef = useRef(currSignee);
  currSigneeRef.current = currSignee;

  // State to store the current user i.e the user who is currently selected / Loggedin
  const [currUser, setCurrUser] = useState<User>(user);
  const currUserRef = useRef(currUser);
  currUserRef.current = currUser;

  useEffect(() => {
    if (PSPDFKit) {
      allUsers.forEach((user) => {
        user.color = randomColor(PSPDFKit, users);
      });
    }
    setUsers(allUsers);
    setCurrUser(user);
    userChange(user, PSPDFKit, instance, setIsVisible, onChangeReadyToSign, setCurrUser);
  }, [user]);

  // State to store the current page index
  const [onPageIndex, setOnPageIndex] = useState<number>(0);
  const onPageIndexRef = useRef(onPageIndex);
  onPageIndexRef.current = onPageIndex;

  const [readyToSign, setReadyToSign] = useState<boolean>(false);

  // For Custom signature / initial field appearance
  const mySignatureIdsRef = useRef([]);
  const [signatureAnnotationIds, setSignatureAnnotationIds] = useState<string[]>([]);

  // For Custom Add Signature / Intitial field appearance
  const [sessionSignatures, setSessionSignatures] = useState<any>([]);
  const [sessionInitials, setSessionInitials] = useState<any>([]);

  function onDragEnd(event: React.DragEvent<HTMLDivElement>) {
    (event.target as HTMLDivElement).style.opacity = "1";
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const [isTextAnnotationMovable, setIsTextAnnotationMovable] = useState(false);
  const isTextAnnotationMovableRef = useRef(isTextAnnotationMovable);
  isTextAnnotationMovableRef.current = isTextAnnotationMovable;

  const onChangeReadyToSign = async (
    value: boolean,
    user: User,
    PSPDFKit: any
  ) => {
    if (instance) {
      setReadyToSign(value);
      if (user.role == "Editor") {
        if (value) {
          instance.setViewState((viewState: any) =>
            viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
          );
          setIsTextAnnotationMovable(false);
        } else {
          instance.setViewState((viewState: any) =>
            viewState.set(
              "interactionMode",
              PSPDFKit.InteractionMode.FORM_CREATOR
            )
          );
          setIsTextAnnotationMovable(true);
        }
      } else {
        instance.setViewState((viewState: any) =>
          viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
        );
        setIsTextAnnotationMovable(false);
      }
    }
  };

  // Tracking whether add Signature/Initial UI
  let isCreateInitial: boolean = false;
  var trackInst:any = null;
  var digitallySigned:any = null;

  const [pdfUrl, setPdfUrl] = useState<string>("/document.pdf");
  // Load PSPDFKit
  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit: any;
    (async function () {
      PSPDFKit = await import("pspdfkit");
      setPSPDFKit(PSPDFKit);
      if (container) {
        if (PSPDFKit) {
          PSPDFKit.unload(container);
        }
        const {UI: { createBlock, Recipes, Interfaces, Core }} = PSPDFKit;
        PSPDFKit.load({
          licenseKey: process.env.NEXT_PUBLIC_LICENSE_KEY as string,
          // @ts-ignore
          ui: {
            [Interfaces.CreateSignature]: ({ props }: any) => {
              return {
                content: createBlock(
                  Recipes.CreateSignature,
                  props,
                  ({ ui }: any) => {
                    if (isCreateInitial) {
                      ui = customizeUIForInitials(ui)
                    }
                    return ui.createComponent();
                  }
                ).createComponent(),
              };
            },
          },
          container,
          document: pdfUrl,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          toolbarItems: [...TOOLBAR_ITEMS],
          disableTextSelection: false,
          customRenderers: {
            Annotation:  ({ annotation }: any) =>{
              if(digitallySigned && annotation.customData?.type === AnnotationTypeEnum.DS){
                const isFieldSigned = digitallySigned.signatures.find((sign: any) => sign.signatureFormFQN === annotation.formFieldName);
                const ele = document.createElement('div');
                if(isFieldSigned) return {node : ele, append: true}
              }
              return getAnnotationRenderers({annotation})
            }
          },
          styleSheets: [`/viewer.css`],
          isEditableAnnotation: function (annotation:any) {
            return !annotation.isSignature;
          },
        }).then(async function (inst: any) {
          trackInst = inst;
          setInstance(inst);

          // **** Getting Digital Signature Info ****
          const info = await inst.getSignaturesInfo();
          if(info.status === "valid" || info.status === "warning") digitallySigned = info;
          // **** Setting Signature Validation Status ****
          await inst.setViewState((viewState:any) => (
             viewState.set("showSignatureValidationStatus", PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED)
          ));

          // **** Setting Page Index ****

          inst.addEventListener("viewState.currentPageIndex.change", (page: any) => {setOnPageIndex(page)});

          // **** Handle Drop event ****

          //@ts-ignore
          const cont = inst.contentDocument.host;
          cont.ondrop = async function (e: any) {
            await handleDrop(e, inst, PSPDFKit, currSigneeRef, currUserRef, onPageIndexRef);
          };

          // **** Handling Add Signature / Initial UI ****
          // START - FILEINVITE CONSOLE LOGS
          inst.addEventListener('document.saveStateChange', async (event: any) => {
            if (event.hasUnsavedChanges && inst) {
              console.log({
                test: 'document.saveStateChange',
                changes: event.hasUnsavedChanges,
              });
            }
          });

          inst.addEventListener("formFieldValues.update", (formFields: any) => {
            if (formFields) {
              const fields = formFields
                  .map((formField: any) => {
                    if (formField) {
                      return {
                        name: formField.name,
                        value: formField['value']
                      };
                    }

                    return formField;
                  })
                  .toArray();

              console.log({
                test: 'formFieldValues.update',
                updatedFormFields: fields
              });
            }
          });
          // END - FILEINVITE CONSOLE LOGS

          // Track which signature form field was clicked on
          // and wether it was an initial field or not.
          inst.addEventListener("annotations.press",
            (event: any) => {
            let lastFormFieldClicked = event.annotation;

            // Load the annotations for the current user and check if it's an initial or signature field
            let annotationsToLoad;
            if (lastFormFieldClicked.customData && lastFormFieldClicked.customData.isInitial === true) {
              annotationsToLoad = sessionInitials;
              isCreateInitial = true;
            } else {
              annotationsToLoad = sessionSignatures;
              isCreateInitial = false;
            }

            //If it's a text widget show duplicate in popup
            if (
              lastFormFieldClicked
            ) {
              const { annotation } = event;
              // Current signer to this field
              const signer = annotation.customData.signerID;
              // Setting Timeout to allow the DOM to update
              setTimeout(() => {
                //Searching for the Property Expando Control Widget where I'll insert the Select Element
                const expandoControl = inst.contentDocument.querySelector(
                  ".PSPDFKit-Expando-Control"
                );
                const containsSelectUser = inst.contentDocument.querySelector("#USER_SELECT_MAIN_DIV");
                if(containsSelectUser) containsSelectUser.remove();
                if (expandoControl
                  && false
                  //&& ( AnnotationTypeEnum.SIGNATURE == lastFormFieldClicked.customData.type || lastFormFieldClicked.customData.type == AnnotationTypeEnum.INITIAL)
                ) {
                  let selectUserHTML = createDynamicSelect(inst, annotation, usersRef.current, signer);
                  expandoControl.insertAdjacentElement("beforeBegin", selectUserHTML)
                };
                const popupFooterDiv = inst.contentDocument.querySelector(".PSPDFKit-2wtzexryxvzwm2ffu1e1vh391u");
                const existingDuplicateButton = inst.contentDocument.querySelector(`.PSPDFKit-Form-Creator-Editor-Duplicate`);
                // Remove existing duplicate button if it exists
                if (existingDuplicateButton) {
                  existingDuplicateButton.remove();
                }
                // Add duplicate button if it doesn't exist
                if(popupFooterDiv && AnnotationTypeEnum.TextField == lastFormFieldClicked.customData.type) {
                  const duplicateButtonHTML = document.createElement("button");
                  duplicateButtonHTML.innerHTML = "Duplicate";
                  duplicateButtonHTML.className = "PSPDFKit-239sjtxdzvwfjbe3ass6aqfp77 PSPDFKit-7kqbgjh4u33aw27zwkrtu57p2e PSPDFKit-68w1xn1tjp178f46bwdhvjg7f1 PSPDFKit-Form-Creator-Editor-Duplicate "+annotation.Id;
                  duplicateButtonHTML.onclick = async () =>{
                    await onPressDuplicate(annotation, PSPDFKit, trackInst);
                  }
                  popupFooterDiv.appendChild(duplicateButtonHTML);
                }
              }, 1);
            }

            if (!isTextAnnotationMovableRef.current && event.annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
              //@ts-ignore
              event.preventDefault();
            }
          });
          let formDesignMode = !1;
          inst.addEventListener("viewState.change", (viewState: any) => {
            formDesignMode = viewState.formDesignMode === true;
          });

          inst.addEventListener(
            "storedSignatures.create",
            async (annotation: any) => {
              // Logic for showing stored signatures and intials in the UI if any
              if (isCreateInitial) {
                setSessionInitials([...sessionInitials, annotation]);
              } else {
                setSessionSignatures([...sessionSignatures, annotation]);
              }
            }
          );

          // **** Handling Signature / Initial fields appearance ****

          inst.addEventListener(
            "annotations.load",
            async function (loadedAnnotations: any) {
              for await (const annotation of loadedAnnotations) {
                await handleAnnotatitonCreation(inst,annotation,mySignatureIdsRef,setSignatureAnnotationIds,currUser.email);
              }
            }
          );

          inst.addEventListener(
            "annotations.create",
            async function (createdAnnotations: any) {
              const annotation = createdAnnotations.get(0);
              await handleAnnotatitonCreation(inst,annotation,mySignatureIdsRef,setSignatureAnnotationIds,currUser.email);
            }
          );

          inst.addEventListener(
            "annotations.delete",
            async (deletedAnnotations: any) => {
              const annotation = deletedAnnotations.get(0);
              await handleAnnotatitonDelete(inst, annotation, currUser?.email);
              const updatedAnnotationIds = mySignatureIdsRef.current.filter((id) => id !== annotation.id);
              setSignatureAnnotationIds(updatedAnnotationIds);
              mySignatureIdsRef.current = updatedAnnotationIds;
            }
          );
          inst.setViewState((viewState: any) => viewState.set("interactionMode",PSPDFKit.InteractionMode.FORM_CREATOR));
          setIsTextAnnotationMovable(true);
        });
      }
    })();
  }, [pdfUrl]);

  const signeeChanged = (signee: User) => {
    setCurrSignee(signee);
    setSelectedSignee(signee);
  };

  const deleteUser = (user: User) => {
    let remainingUsers = users.filter((userL: User) => userL.id !== user.id);
    let currSig = users.find(
      (userL) => user !== userL && userL.role !== "Editor"
    );
    setUsers(remainingUsers);
    currSig ? signeeChanged(currSig) : alert("No Signee left");
  };

  const [isLoading, setIsLoading] = useState(false);

  const [selectedSignee, setSelectedSignee] = useState(currSigneeRef.current);

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "top", position: "fixed", width: "100%" }}>
        <SidePanel
          users={users}
          currUser={currUser}
          currSignee={currSignee}
          userChange={(user:User)=>userChange(user, PSPDFKit, instance, setIsVisible, onChangeReadyToSign, setCurrUser)}
          PSPDFKit={PSPDFKit}
          isVisible={isVisible}
          selectedSignee={selectedSignee}
          signeeChanged={signeeChanged}
          deleteUser={deleteUser}
          addSignee={()=>addSignee(setUsers, PSPDFKit, users)}
          onDragStart={(event: React.DragEvent<HTMLDivElement>, type: string) => onDragStart(event, type, currSignee, instance)}
          onDragEnd={onDragEnd}
          applyDSign={applyDSign}
          instance={instance}
          containerRef={containerRef}
          setIsLoading={setIsLoading}
          setPdfUrl={setPdfUrl}
        />
        {/* PSPDFKit div */}
        <div
          onDragOver={handleDragOver}
          ref={containerRef}
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

export default dynamic(() => Promise.resolve(SignDemo), { ssr: false });
