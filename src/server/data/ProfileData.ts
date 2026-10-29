import Sift from "@rbxts/sift";
import { PlayerData } from "shared/data/PlayerData";

export interface ProfileData extends PlayerData {
	readonly schemaVersion: number;
	readonly lastSeenAt: number;
	readonly receipts: Readonly<Record<string, number>>;
}

export const currentSchemaVersion = 1;

export const template: ProfileData = {
	schemaVersion: currentSchemaVersion,
	cash: 0,
	lastSeenAt: 0,
	receipts: {},
};

function isNatural(value: unknown): value is number {
	return (
		typeIs(value, "number") &&
		value === value &&
		math.abs(value) < math.huge &&
		value >= 0 &&
		value % 1 === 0
	);
}

export function validate(data: unknown) {
	if (!typeIs(data, "table")) {
		return false;
	}
	const record = data as Record<string, unknown>;
	if (record.schemaVersion !== undefined && record.schemaVersion !== currentSchemaVersion) {
		return false;
	}
	for (const key of ["cash", "lastSeenAt"]) {
		const value = record[key];
		if (value !== undefined && !isNatural(value)) {
			return false;
		}
	}
	const receipts = record.receipts;
	if (receipts !== undefined) {
		if (!typeIs(receipts, "table")) {
			return false;
		}
		for (const [purchaseId, grantedAt] of pairs(receipts as Record<string, unknown>)) {
			if (!typeIs(purchaseId, "string") || purchaseId.size() === 0 || !isNatural(grantedAt)) {
				return false;
			}
		}
	}
	return true;
}

export function migrate(data: ProfileData) {
	return data;
}

export function toPlayerData(data: ProfileData): PlayerData {
	return Sift.Dictionary.removeKeys(data, "schemaVersion", "lastSeenAt", "receipts");
}

export function samePlayerData(a: PlayerData, b: PlayerData) {
	return Sift.Dictionary.equals(a, b);
}
