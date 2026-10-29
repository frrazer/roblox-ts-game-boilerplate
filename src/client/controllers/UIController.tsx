import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createPortal, createRoot, Root } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { closeScreen, openScreen, openScreens } from "client/store/screens";
import { App } from "client/ui/App";
import { ScreenName } from "client/ui/screens";

@Controller()
export class UIController implements OnStart {
	private root?: Root;

	onStart() {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		this.root = createRoot(new Instance("Folder"));
		this.root.render(createPortal(<App />, playerGui));
	}

	open(name: ScreenName) {
		openScreen(name);
	}

	close(name: ScreenName) {
		closeScreen(name);
	}

	isOpen(name: ScreenName) {
		return openScreens().has(name);
	}
}
