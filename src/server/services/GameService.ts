import { OnStart, Service } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { Functions } from "server/network";
import { GameConfig } from "shared/config/GameConfig";

@Service()
export class GameService implements OnStart {
	onStart() {
		Functions.ping.setCallback(() => Workspace.GetServerTimeNow());
		print(`[${GameConfig.name}] Server services ready`);
	}
}
