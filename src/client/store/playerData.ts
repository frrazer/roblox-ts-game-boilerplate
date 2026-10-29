import { atom } from "@rbxts/charm";
import { PlayerData } from "shared/data/PlayerData";

export const playerData = atom<PlayerData | undefined>(undefined);
