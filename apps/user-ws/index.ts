import { WebSocketServer, WebSocket as TypeWsWebSocket } from "ws";
const port = 8081; // or 8081

const wss = new WebSocketServer({ port });

interface Room {
  sockets: TypeWsWebSocket[];
}

const rooms: Record<string, Room> = {};

const RELAY_URL = 'ws://localhost:3001'
const relaySocket = new WebSocket(RELAY_URL);


console.log(`[WebSocket Server] Running on ws://localhost:${port}`);


// 1. when server recieves a join roon message, server handles room allocation. 
// 2. Message broadcasting is forwarded to the relayer service WS server. 



wss.on("connection", (ws) => {
  console.log(`[ws:${port}] Client connected`);
  ws.on("error", console.error);

  ws.on("message", (data: string) => {

    const parsedData = JSON.parse(data);
    if (parsedData.type === 'join-room') {
      const room = parsedData.room

      if (!rooms[ room ]) {
        rooms[ room ] = { sockets: [] }
      }
      rooms[ room ]?.sockets.push(ws)
    }

    if (parsedData.type === 'chat') {
      relaySocket.send(data);
    }
  });
});

relaySocket.onmessage = ({ data }: { data: string }) => {
  const parsedData = JSON.parse(data);
  console.log('Relay Socket Received:', parsedData);

  if (parsedData.type === 'chat') {
    const room = parsedData.room;
    rooms[ room ]?.sockets.map((sockets) => sockets.send(data));
  }
}



