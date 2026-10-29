import React from "@rbxts/react";
import type { ScreenName } from ".";

export interface ScreenProps {
	readonly open: boolean;
	readonly openScreen: (name: ScreenName) => void;
	readonly closeScreen: (name: ScreenName) => void;
}

export interface ScreenDefinition {
	readonly component: React.FunctionComponent<ScreenProps>;
	readonly modal: boolean;
	readonly startsOpen: boolean;
}
