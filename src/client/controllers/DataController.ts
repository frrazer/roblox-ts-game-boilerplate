import { Controller, OnStart } from "@flamework/core";
import { client, SyncPayload } from "@rbxts/charm-sync";
import { Players } from "@rbxts/services";
import { Events } from "client/network";
import { playerData } from "client/store/playerData";
import { playerDataKey } from "shared/data/PlayerData";

@Controller({ loadOrder: 0 })
export class DataController implements OnStart {
	onStart() {
		client.addSignals({ [playerDataKey(Players.LocalPlayer.UserId)]: playerData });
		Events.data.sync.connect((payloads) => client.patch(payloads as SyncPayload[]));
		Events.data.start.fire();
	}

	get() {
		return playerData();
	}

	isLoaded() {
		return playerData() !== undefined;
	}
}
