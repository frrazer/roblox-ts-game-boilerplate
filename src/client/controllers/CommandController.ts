import { Controller, OnStart } from "@flamework/core";
import * as Conch from "@rbxts/conch";
import * as ConchUI from "@rbxts/conch-ui";
import { Players } from "@rbxts/services";
import { GameConfig } from "shared/config/GameConfig";

@Controller()
export class CommandController implements OnStart {
	private bound = false;

	onStart() {
		Conch.initiate_default_lifecycle();
		Conch.register_default_commands();
		const player = Players.LocalPlayer;
		player.GetAttributeChangedSignal("CommandsEnabled").Connect(() => this.refresh(player));
		this.refresh(player);
	}

	private refresh(player: Player) {
		if (this.bound || player.GetAttribute("CommandsEnabled") !== true) {
			return;
		}
		this.bound = true;
		ConchUI.bind_to(GameConfig.commandKey);
	}
}
