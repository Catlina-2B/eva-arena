/**
 * WebSocket Services - Centralized export
 */

export { trenchSocketClient } from "./client";
export type { ConnectionStatus } from "./client";

export { subscribeTrench, unsubscribeTrench } from "./trench";
export type { TrenchEventHandlers } from "./trench";

export { subscribeUser, unsubscribeUser } from "./user";
export type { UserEventHandlers } from "./user";
