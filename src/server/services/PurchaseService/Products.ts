import type { DataService } from "server/services/DataService";

export interface PurchaseContext {
	readonly dataService: DataService;
}

export type Grant = (player: Player, context: PurchaseContext) => boolean;

export const products: ReadonlyMap<number, Grant> = new Map<number, Grant>([]);
