"use client";
import { User, AIMessage } from "../src/types";
import { useEffect, useState } from "react";
import { ChatDialog } from "@baseline-ui/recipes";
import {askAI} from "./api/askAI";
import dynamic from "next/dynamic";
import { chatBotSVG } from "../src/utils/icons";
import { getDefaultUsers } from "../src/utils/userUtils";

const DynamicSignComp = dynamic(() => import("../src/components/SigningDemo"), { ssr: false });
const I18nProvider = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.I18nProvider),
  { ssr: false }
);
const ThemeProvider = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

const App: React.FC = () => {
  const allUsers: User[] = getDefaultUsers();
  const [currUser, setCurrUser] = useState(allUsers[0]);

  const aiName = "AI";
  const initMessages = [
    {
      type: "PLAIN",
      text: "Welcome to the PSPDFKit Sign App! Ask me anything about the code, like “How do I set the signees?",
      sender: aiName,
      canCopy: true,
      isComplete: true,
      id: "1",
    },
  ];
  const [messages, setMessages] = useState([...initMessages]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  useEffect(() => {
    var PSPDFKit: any;
    (async function () {
      PSPDFKit = await import("@nutrient-sdk/viewer");
      allUsers.forEach((user: any) => {
        user.color = PSPDFKit.Color.LIGHT_BLUE;
      });
    })();
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider theme={"system"}>
      <I18nProvider locale="en-US">
        <DynamicSignComp allUsers={allUsers} user={currUser} />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            border: "0.5px solid grey",
            borderRadius: isChatOpen ? "10px" : "50%",
            width: isChatOpen ? "35vh" : "8vh",
            height: isChatOpen ? "70vh" : "8vh",
            padding: isChatOpen ? "10px" : "0px",
            boxShadow: "1px",
          }}
        >
          {isChatOpen ? (
            <div
              style={{
                position: "sticky",
                cursor: "pointer",
              }}
              onClick={() => {
                setIsChatOpen(!isChatOpen);
              }}
              className="heading-custom-style"
            >
              Ask AI (Beta) <span style={{ float: "right" }}>&times;</span>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: isChatOpen ? "10px" : "50%",
                width: isChatOpen ? "35vh" : "8vh",
                height: isChatOpen ? "60vh" : "8vh",
                backgroundColor: "#6EB579 ",
              }}
              onClick={() => {
                setIsChatOpen(!isChatOpen);
              }}
            >
              {chatBotSVG}
            </div>
          )}
          {isChatOpen && (
            <ChatDialog
              style={{ height: "62vh", width: "100%", overflow: "auto" }}
              //@ts-ignore
              messages={messages}
              onInputChanged={async function Da(inp) {
                // Input change handler - currently no action needed
              }}
              onMessageSubmit={async function Da(inp) {
                console.log("Message Submitted : ", inp);

                const newMessage = {
                  type: "PLAIN",
                  text: inp,
                  sender: "You",
                  isComplete: true,
                  canCopy: true,
                  id: Math.random().toString(),
                };

                setMessages([...messages, newMessage]);
                const newAIMessage: AIMessage = {
                  role: "user",
                  content: inp,
                };
                await askAI([...aiMessages, newAIMessage]).then((res) => {
                  if (res) {
                    setAiMessages([
                      ...aiMessages,
                      { role: "user", content: inp },
                      res["choices"][0]["message"],
                    ]);
                    setMessages([
                      ...messages,
                      newMessage,
                      {
                        type: "PLAIN",
                        text: res["choices"][0]["message"]["content"],
                        sender: aiName,
                        isComplete: true,
                        canCopy: true,
                        id: Math.random().toString(),
                      },
                    ]);
                  }
                });
              }}
            />
          )}
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
};
export default dynamic(() => Promise.resolve(App), { ssr: false });
