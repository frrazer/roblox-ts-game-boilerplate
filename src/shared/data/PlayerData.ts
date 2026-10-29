export interface PlayerData {
	readonly cash: number;
}

export function playerDataKey(userId: number) {
	return `playerData/${userId}`;
}
