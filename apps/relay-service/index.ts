import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const servers: WebSocket[] = []

wss.on("connection", (ws) => {
  ws.on('error', console.error)

  servers.push(ws)

  ws.on("message", (data: string) => {
    // Send message to all websockets
    // why not filter out current server? - equal latency on all servers 
    servers.map((server) => {
      server.send(data)
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