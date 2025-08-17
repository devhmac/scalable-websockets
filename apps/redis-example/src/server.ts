import express from "express";
import type { ChatMessage, SocketEvent } from "@repo/types";
import { WebSocketServer } from "ws";
import redisClient from "./redisClient";
import { measureMemory } from "vm";
import type { Socket } from "dgram";
const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const server = app.listen(port, () => {
  console.log(`Web server is running on port:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WS Client connected");

  // send chat history from redis to client
  redisClient.lRange("chat_messages", 0, -1).then(
    (messages) => {
      console.log("Current redis messages", messages);
      messages.forEach((message) => {
        console.log(message);
        ws.send(message);
      });
    },
    (error) =>
      console.error("Error retrieving messages from redis cache", error)
  );

  ws.on("message", (data) => {
    const event: SocketEvent = JSON.parse(data.toString());
    handleSocketEvent(event);
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:3000");

const handleSocketEvent = (data: SocketEvent) => {
  if (data.event === "ping") {
    console.log("Client Ping recieved");
    return;
  }
  if (data.event === "chat") {
    const message = data.message;
    message.timestamp = Date.now();

    const messageData = JSON.stringify(message);
    console.log("incoming data", messageData);

    // Push message to redis
    redisClient.rPush("chat_messages", messageData);

    // keeps only the last 100 messages in cache
    redisClient.lTrim("chat_messages", -100, -1);
    console.log("Currently ", wss.clients.size, " clients connected");
    wss.clients.forEach((client) => {
      if (client.OPEN) {
        client.send(messageData);
      }
    });
  }
};
