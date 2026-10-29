import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { closeScreen, openScreen, openScreens } from "client/store/screens";
import { screens } from "./screens";
import { ScreenDefinition } from "./screens/types";

const definitions = screens as Readonly<Record<string, ScreenDefinition>>;

export function App() {
	const open = useAtom(openScreens);
	const elements = new Array<React.Element>();
	for (const [name, definition] of pairs(definitions)) {
		const Component = definition.component;
		elements.push(
			<Component key={name} open={open.has(name)} openScreen={openScreen} closeScreen={closeScreen} />,
		);
	}
	return <>{elements}</>;
}
