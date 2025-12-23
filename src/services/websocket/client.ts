import { io, Socket } from "socket.io-client";

import { API_BASE_URL } from "@/services/api/client";

/**
 * WebSocket connection status
 */
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * WebSocket client singleton for Trench namespace
 */
class TrenchSocketClient {
  private socket: Socket | null = null;
  private status: ConnectionStatus = "disconnected";
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  /**
   * Get the socket instance, creating it if necessary
   */
  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(`${API_BASE_URL}/trench`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: false,
      });

      this.setupEventListeners();
    }

    return this.socket;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    const socket = this.getSocket();

    if (!socket.connected) {
      this.setStatus("connecting");
      socket.connect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.setStatus("disconnected");
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately notify with current status
    listener(this.status);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[TrenchSocket] Connected:", this.socket?.id);
      this.setStatus("connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[TrenchSocket] Disconnected:", reason);
      this.setStatus("disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("[TrenchSocket] Connection error:", error.message);
      this.setStatus("error");
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.log("[TrenchSocket] Reconnecting... Attempt:", attempt);
      this.setStatus("connecting");
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(
        "[TrenchSocket] Reconnected after",
        attemptNumber,
        "attempts",
      );
      this.setStatus("connected");
    });

    this.socket.on("reconnect_failed", () => {
      console.error("[TrenchSocket] Reconnection failed");
      this.setStatus("error");
    });
  }
}

// Export singleton instance
export const trenchSocketClient = new TrenchSocketClient();
