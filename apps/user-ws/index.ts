import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  sockets: WebSocket[];
}

const rooms: Record<string, Room> = {};

// Whenever a user connects and sends a message,
//  1. There will be a joined room message sent
// 2. there will be a chat message

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data: string) => {
    console.log("Received message:", data);

    const parsedData = JSON.parse(data);

    // if data is a join-room, add current socket connection to room (Or create if does not yet exist)
    if (parsedData.type === "join-room") {
      const room = parsedData.room;

      if (!rooms[room]) {
        rooms[room] = { sockets: [] };
      }

      rooms[room]?.sockets.push(ws);
    }

    // If the data == chat, broadcast it to all sockets in the room
    if (parsedData.type == "chat") {
      const room = parsedData.room;
      rooms[room]?.sockets.map((socket) => {
        socket.send(data);
      });
    }
  });

  ws.send("something");
});
