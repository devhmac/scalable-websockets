"use client";
import { ChatMessage } from "@repo/types";
import { useState } from "react";
import { useLiveChat } from "./hooks/useLiveChat";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Circle, LoaderIcon } from "lucide-react";
import ChatMessageContainer from "./components/ChatMessageContainer";

export default function Home() {
  const [clientId] = useState(() => {
    if (typeof window === "undefined") return ""; // SSR safe
    let id = localStorage.getItem("clientId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("clientId", id);
    }
    return id;
  });
  const [newMessage, setNewMessage] = useState("");
  const { connectionStatus, messages, sendMessage } = useLiveChat();

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (connectionStatus === "connected") {
      try {
        const message: ChatMessage = {
          username: clientId,
          message: newMessage,
          timestamp: Date.now(),
        };
        sendMessage(message);
        setNewMessage("");
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <div>
      <main className="h-screen flex items-center justify-center sm:p-7">
        <div className="mx-auto h-full rounded-md border shadow-xl w-full max-w-2xl relative p-2 flex flex-col">
          <div className="pb-3">
            {connectionStatus === "connecting" ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <Badge
                className={`bg-${
                  connectionStatus === "connected" ? "green" : "gray"
                }-300 border-${connectionStatus === "connected" ? "green" : "gray"}-800 text-${connectionStatus === "connected" ? "green" : "gray"}-800`}
              >
                <Circle />
                {connectionStatus}
              </Badge>
            )}
          </div>
          <ChatMessageContainer messages={messages} clientId={clientId} />
          <form
            onSubmit={handleSendMessage}
            className=" p-2 flex gap-2 bg-white"
          >
            <Input
              className=""
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              placeholder="Chat Message"
            />

            <Button type="submit" disabled={connectionStatus !== "connected"}>
              Send
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
