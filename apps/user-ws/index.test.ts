import { describe, test, expect } from "bun:test";
import { waitForSocketOpen } from "./utils";

const BACKEND_URL = "ws://localhost:8080";
const BACKEND_URL2 = "ws://localhost:8081";

describe("Chat application", () => {
  test("message sent from room 1 broadcasts to all sockets in room 1", async () => {
    const ws1 = new WebSocket(BACKEND_URL);
    const ws2 = new WebSocket(BACKEND_URL2);

    console.log('Socket Connections')
    await Promise.allSettled([
      waitForSocketOpen(ws1),
      waitForSocketOpen(ws2),
    ])
    console.log('Sockets Connected')

    ws1.send(
      JSON.stringify({
        type: "join-room",
        room: "Room 1",
      })
    );

    ws2.send(
      JSON.stringify({
        type: "join-room",
        room: "Room 1",
      })
    );

    await new Promise<void>((resolve, reject) => {
      console.log('Awaiting ws2 message reciept')

      ws2.onmessage = ({ data }: { data: string }) => {

        const parsedData = JSON.parse(data);

        console.log('WS 2 received:', parsedData);

        expect(parsedData.type).toBe("chat");
        expect(parsedData.room).toBe("Room 1");
        expect(parsedData.message).toBe("Hello from ws1");

        resolve()
      }

      ws1.send(
        JSON.stringify({
          type: "chat",
          room: "Room 1",
          message: "Hello from ws1",
        })
      );
    })

  })

});

