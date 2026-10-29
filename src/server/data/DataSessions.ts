import { atom, Atom, Getter } from "@rbxts/charm";
import ProfileStore from "@rbxts/profile-store";
import { migrate, ProfileData, validate } from "./ProfileData";

type Profile = ProfileStore.Profile<ProfileData>;
type Store = ProfileStore.Store<ProfileData>;

interface Session {
	readonly profile: Profile;
	readonly state: Atom<ProfileData>;
}

export class DataSessions {
	private readonly sessions = new Map<Player, Session>();
	private readonly loading = new Set<Player>();
	private closed = false;

	constructor(
		private readonly store: Store,
		private readonly isPresent: (player: Player) => boolean,
	) {}

	load(player: Player) {
		if (this.closed || this.loading.has(player) || this.sessions.has(player) || !this.isPresent(player)) {
			return;
		}
		this.loading.add(player);
		const [ok, result] = pcall(
			() =>
				this.store.StartSessionAsync(`Player_${player.UserId}`, {
					Cancel: () => this.closed || !this.isPresent(player),
				}) as Profile | undefined,
		);
		this.loading.delete(player);
		if (!ok || result === undefined) {
			if (!ok) {
				warn(`[DataService] Load failed for ${player.UserId}: ${tostring(result)}`);
			}
			if (!this.closed && this.isPresent(player)) {
				player.Kick("Your data couldn't be loaded. Please rejoin.");
			}
			return;
		}
		const profile = result;
		if (this.closed || !this.isPresent(player)) {
			profile.EndSession();
			return;
		}
		if (!validate(profile.Data)) {
			warn(`[DataService] Unsupported or invalid data for ${player.UserId}; progress was not reset`);
			profile.EndSession();
			player.Kick("Your saved data couldn't be opened. Please try again later.");
			return;
		}
		profile.AddUserId(player.UserId);
		profile.Data = migrate(profile.Data);
		profile.Reconcile();
		const session: Session = { profile, state: atom(profile.Data) };
		profile.OnSave.Connect(() => {
			this.write(session, { ...session.state(), lastSeenAt: os.time() });
		});
		profile.OnSessionEnd.Connect(() => {
			if (this.sessions.get(player) !== session) {
				return;
			}
			this.sessions.delete(player);
			if (!this.closed && this.isPresent(player)) {
				player.Kick("Your data session ended. Please rejoin.");
			}
		});
		if (!profile.IsActive()) {
			player.Kick("Your data session ended. Please rejoin.");
			return;
		}
		this.sessions.set(player, session);
	}

	getState(player: Player): Getter<ProfileData> | undefined {
		return this.active(player)?.state;
	}

	getData(player: Player) {
		return this.active(player)?.state();
	}

	update(player: Player, updater: (data: ProfileData) => ProfileData) {
		const session = this.active(player);
		if (!session) {
			return false;
		}
		const current = session.state();
		const nextData = updater(current);
		if (nextData !== current) {
			this.write(session, nextData);
		}
		return true;
	}

	requestSave(player: Player) {
		const session = this.active(player);
		if (!session) {
			return false;
		}
		session.profile.Save();
		return true;
	}

	waitForSave(player: Player, saved: (snapshot: ProfileData) => boolean) {
		const session = this.active(player);
		if (!session) {
			return false;
		}
		const profile = session.profile;
		const deadline = os.clock() + 25;
		let nextSave = 0;
		while (os.clock() < deadline) {
			if (saved(profile.LastSavedData)) {
				return true;
			}
			if (this.active(player) !== session) {
				return false;
			}
			if (os.clock() >= nextSave) {
				profile.Save();
				nextSave = os.clock() + 5;
			}
			if (saved(profile.LastSavedData)) {
				return true;
			}
			task.wait(0.1);
		}
		return saved(profile.LastSavedData);
	}

	release(player: Player) {
		const session = this.sessions.get(player);
		this.sessions.delete(player);
		session?.profile.EndSession();
	}

	destroy() {
		this.closed = true;
		for (const [player] of this.sessions) {
			this.release(player);
		}
	}

	private active(player: Player) {
		const session = this.sessions.get(player);
		if (this.closed || !this.isPresent(player) || !session || !session.profile.IsActive()) {
			return undefined;
		}
		return session;
	}

	private write(session: Session, data: ProfileData) {
		session.state(data);
		session.profile.Data = data;
	}
}
