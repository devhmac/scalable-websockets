"use client";
import { ChatMessage } from "@repo/types";
import { useEffect, useRef, useState } from "react";

export const useWebsocketServer = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const sendMessage = (message: ChatMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const wsEvent = { event: "chat", message };
      wsRef.current.send(JSON.stringify(wsEvent));
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    console.log("protocol: ", protocol);
    const ws = new WebSocket(`${protocol}//localhost:3001`);
    // const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("FE Client Socket Connected");
      setConnectionStatus("connected");
    };
    ws.onclose = () => {
      console.log("FE Client Socket disconnected");
      setConnectionStatus("disconnected");
    };

    ws.onmessage = (event) => {
      console.log("event recieved", event);

      const incomingMessage = JSON.parse(event.data);

      setMessages((prev) => [...prev, incomingMessage]);
    };
    // Set Timeout pings
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("Pinging ws Server");
        ws.send('{"event":"ping"}');
      }
    }, 29000);
    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setMessages]);
  return { connectionStatus, sendMessage };
};
