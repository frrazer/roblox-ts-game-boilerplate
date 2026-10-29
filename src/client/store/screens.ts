import { atom } from "@rbxts/charm";
import { ScreenName, screens } from "client/ui/screens";
import { ScreenDefinition } from "client/ui/screens/types";

const definitions = screens as Readonly<Record<string, ScreenDefinition | undefined>>;

function initialScreens() {
	const open = new Set<string>();
	for (const [name, definition] of pairs(definitions)) {
		if (definition.startsOpen) {
			open.add(name);
		}
	}
	return open;
}

export const openScreens = atom<ReadonlySet<string>>(initialScreens());

export function openScreen(name: ScreenName) {
	const modal = definitions[name]?.modal ?? false;
	openScreens((current) => {
		if (current.has(name)) {
			return current;
		}
		const updated = new Set<string>();
		for (const openName of current) {
			if (!modal || !definitions[openName]?.modal) {
				updated.add(openName);
			}
		}
		updated.add(name);
		return updated;
	});
}

export function closeScreen(name: ScreenName) {
	openScreens((current) => {
		if (!current.has(name)) {
			return current;
		}
		const updated = new Set<string>();
		for (const openName of current) {
			if (openName !== name) {
				updated.add(openName);
			}
		}
		return updated;
	});
}
