import { Modding, OnInit, OnStart, Service } from "@flamework/core";
import { computed, Getter } from "@rbxts/charm";
import { server } from "@rbxts/charm-sync";
import ProfileStore from "@rbxts/profile-store";
import { Players, RunService } from "@rbxts/services";
import { DataSessions } from "server/data/DataSessions";
import { ProfileData, samePlayerData, template, toPlayerData } from "server/data/ProfileData";
import { Events } from "server/network";
import { PlayerData, playerDataKey } from "shared/data/PlayerData";

export interface OnPlayerDataLoaded {
	onPlayerDataLoaded(player: Player, data: ProfileData): void;
}

export interface OnPlayerDataReleasing {
	onPlayerDataReleasing(player: Player, data: ProfileData): void;
}

const maxBalance = 9007199254740991;

@Service({ loadOrder: 0 })
export class DataService implements OnInit, OnStart {
	private readonly loadedListeners = new Set<OnPlayerDataLoaded>();
	private readonly releasingListeners = new Set<OnPlayerDataReleasing>();
	private readonly views = new Map<Player, Getter<PlayerData>>();
	private readonly syncRequests = new Set<Player>();
	private readonly synced = new Set<Player>();
	private sessions?: DataSessions;
	private stopped = false;
	private warnedMock = false;

	onInit() {
		Modding.onListenerAdded<OnPlayerDataLoaded>((listener) => this.loadedListeners.add(listener));
		Modding.onListenerRemoved<OnPlayerDataLoaded>((listener) => this.loadedListeners.delete(listener));
		Modding.onListenerAdded<OnPlayerDataReleasing>((listener) => this.releasingListeners.add(listener));
		Modding.onListenerRemoved<OnPlayerDataReleasing>((listener) =>
			this.releasingListeners.delete(listener),
		);
		const store = ProfileStore.New(RunService.IsStudio() ? "PlayerData_Studio" : "PlayerData", template);
		this.sessions = new DataSessions(store, (player) => player.Parent === Players);
	}

	onStart() {
		server.connect((player, payloads) => Events.data.sync.fire(player, payloads));
		Events.data.start.connect((player) => {
			this.syncRequests.add(player);
			this.trySync(player);
		});
		Players.PlayerAdded.Connect((player) => this.load(player));
		Players.PlayerRemoving.Connect((player) => this.release(player));
		for (const player of Players.GetPlayers()) {
			task.defer(() => this.load(player));
		}
		game.BindToClose(() => this.shutdown());
	}

	getData(player: Player) {
		return this.sessions?.getData(player);
	}

	getState(player: Player) {
		return this.sessions?.getState(player);
	}

	update(player: Player, updater: (data: ProfileData) => ProfileData) {
		return this.sessions?.update(player, updater) ?? false;
	}

	adjustCash(player: Player, amount: number) {
		if (amount !== amount || math.abs(amount) === math.huge || amount % 1 !== 0) {
			return false;
		}
		const data = this.getData(player);
		if (!data) {
			return false;
		}
		const balance = data.cash + amount;
		if (balance < 0 || balance > maxBalance) {
			return false;
		}
		return this.update(player, (current) => ({ ...current, cash: balance })) && this.requestSave(player);
	}

	requestSave(player: Player) {
		return this.sessions?.requestSave(player) ?? false;
	}

	waitForSave(player: Player, saved: (snapshot: ProfileData) => boolean) {
		return this.sessions?.waitForSave(player, saved) ?? false;
	}

	private load(player: Player) {
		while (ProfileStore.DataStoreState === "NotReady" && !this.stopped && player.Parent === Players) {
			task.wait();
		}
		if (this.stopped || player.Parent !== Players) {
			return;
		}
		if (ProfileStore.DataStoreState !== "Access" && !this.warnedMock) {
			this.warnedMock = true;
			warn(
				`[DataService] DataStores unavailable (${ProfileStore.DataStoreState}); using mock data that resets when Play stops. Enable Studio Access to API Services to test saving.`,
			);
		}
		const sessions = this.sessions;
		if (!sessions) {
			return;
		}
		sessions.load(player);
		const state = sessions.getState(player);
		if (!state) {
			return;
		}
		this.views.set(
			player,
			computed((previous?: PlayerData) => {
				const current = toPlayerData(state());
				return previous !== undefined && samePlayerData(previous, current) ? previous : current;
			}),
		);
		this.trySync(player);
		const data = state();
		for (const listener of this.loadedListeners) {
			task.spawn(() => listener.onPlayerDataLoaded(player, data));
		}
	}

	private trySync(player: Player) {
		const view = this.views.get(player);
		if (!view || !this.syncRequests.has(player) || this.synced.has(player)) {
			return;
		}
		this.synced.add(player);
		server.addSignalsToClient(player, { [playerDataKey(player.UserId)]: view });
	}

	private releasing(player: Player) {
		const data = this.getData(player);
		if (!data) {
			return;
		}
		for (const listener of this.releasingListeners) {
			task.spawn(() => listener.onPlayerDataReleasing(player, data));
		}
	}

	private release(player: Player) {
		this.releasing(player);
		this.sessions?.release(player);
		this.views.delete(player);
		this.syncRequests.delete(player);
		if (this.synced.delete(player)) {
			server.removeClient(player);
		}
	}

	private shutdown() {
		this.stopped = true;
		for (const player of Players.GetPlayers()) {
			this.releasing(player);
		}
		this.sessions?.destroy();
	}
}
