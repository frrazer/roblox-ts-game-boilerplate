import { OnStart, Service } from "@flamework/core";
import * as Conch from "@rbxts/conch";
import { Players, RunService } from "@rbxts/services";
import { CommandConfig } from "server/config/CommandConfig";
import { DataService } from "server/services/DataService";

@Service()
export class CommandService implements OnStart {
	constructor(private readonly dataService: DataService) {}

	onStart() {
		for (const [role, permissions] of pairs(CommandConfig.rolePermissions)) {
			Conch.set_role_permissions(role, ...permissions);
		}
		Conch.initiate_default_lifecycle();
		this.registerCommands();
		Players.PlayerAdded.Connect((player) => this.grantRoles(player));
		for (const player of Players.GetPlayers()) {
			task.spawn(() => this.grantRoles(player));
		}
	}

	private registerCommands() {
		Conch.register("give-cash", {
			description: "Adds cash to a player's saved balance. Use a negative amount to remove cash.",
			permissions: ["manage-data"],
			arguments: () =>
				$tuple(
					Conch.args.player("player", "The player whose balance changes"),
					Conch.args.number("amount", "Whole amount to add"),
				),
			callback: (player, amount) => {
				if (!this.dataService.adjustCash(player, amount)) {
					Conch.log("error", `Couldn't change ${player.Name}'s cash by ${amount}`);
					return;
				}
				Conch.log("info", `${player.Name} now has ${this.dataService.getData(player)?.cash} cash`);
			},
		});
	}

	private grantRoles(player: Player) {
		const roles = [...(CommandConfig.userRoles[player.UserId] ?? [])];
		if (this.isOwner(player)) {
			roles.push("super-user");
		}
		if (roles.size() === 0 || player.Parent !== Players) {
			return;
		}
		Conch.give_roles(Conch.get_user(player), ...roles);
		player.SetAttribute("CommandsEnabled", true);
	}

	private isOwner(player: Player) {
		if (RunService.IsStudio()) {
			return true;
		}
		if (game.CreatorType === Enum.CreatorType.User) {
			return player.UserId === game.CreatorId;
		}
		const [ok, rank] = pcall(() => player.GetRankInGroup(game.CreatorId));
		return ok && rank >= CommandConfig.groupSuperUserRank;
	}
}
