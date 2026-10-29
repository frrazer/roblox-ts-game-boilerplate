import { Networking } from "@flamework/networking";

export interface SyncPacket {
	readonly type: "init" | "patch";
	readonly data: Readonly<Record<string, unknown>>;
}

interface ClientToServerEvents {
	data: {
		start(): void;
	};
}

interface ServerToClientEvents {
	data: {
		sync(payloads: readonly SyncPacket[]): void;
	};
}

interface ClientToServerFunctions {
	ping(): number;
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
