export type SocketEvent =
  | { event: "chat"; message: ChatMessage }
  | { event: "ping" };

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}
