export const waitForSocketOpen = (ws: WebSocket): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    ws.onopen = () => {
      resolve();
    }
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

  });
}