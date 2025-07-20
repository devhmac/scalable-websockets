import { WebSocketServer, WebSocket } from "ws";
const port = 3001; // or 8081


const wss = new WebSocketServer({ port });
console.log(`[Relay Server] Running on ws://localhost:${port}`);


const servers: WebSocket[] = []
// Realistically this would just be a Redis PUB/SUB
wss.on("connection", (ws) => {
  console.log('Server Connected')
  ws.on('error', console.error)

  servers.push(ws)

  ws.on("message", (data: string) => {
    // Send message to all websockets
    // why not filter out current server? - equal latency on all servers 
    servers.map(socket => {
      socket.send(data)
    })
  })

  ws.on("close", (data: string) => {
    // On close Remove the current websocket from the servers array
    const index = servers.indexOf(ws);
    if (index > -1) {
      servers.splice(index, 1);
    }
  });

});