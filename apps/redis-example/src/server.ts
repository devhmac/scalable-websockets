import express from "express";
import { WebSocketServer } from "ws";
import redisClient from "./redisClient";
import type { ChatMessage } from "./chatMessage";
import { measureMemory } from "vm";
const app = express();
const port = 3000;
app.get("/");

const server = app.listen(port, () => {
  console.log(`Web server is running on port:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WS Client connected");

  // send chat history from redis to client
  redisClient.lRange("chat_message", 0, -1).then(
    (messages) => {
      messages.forEach((message) => {
        ws.send(message);
      });
    },
    (error) =>
      console.error("Error retrieving messages from redis cache", error)
  );

  ws.on("message", (data) => {
    const message: ChatMessage = JSON.parse(data.toString());
    message.timestamp = Date.now();

    const messageData = JSON.stringify(message);

    // Push message to redis
    redisClient.rPush("chat_messages", messageData);

    // keeps only the last 100 messages in cache
    redisClient.lTrim("chat_messages", -100, -1);

    wss.clients.forEach((client) => {
      if (client.OPEN) {
        client.send(messageData);
      }
    });
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:3000");
