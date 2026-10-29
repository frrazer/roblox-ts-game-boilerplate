import { Networking } from "@flamework/networking";
import { Players, RunService } from "@rbxts/services";
import { RateLimit } from "shared/utils/RateLimit";

const limiters = new Set<RateLimit>();
let cleanup: RBXScriptConnection | undefined;

function track(limiter: RateLimit) {
	cleanup ??= Players.PlayerRemoving.Connect((player) => {
		for (const tracked of limiters) {
			tracked.remove(player);
		}
	});
	limiters.add(limiter);
	return limiter;
}

function allow(limiter: RateLimit, name: string, player?: Player) {
	if (!player || limiter.allow(player)) {
		return true;
	}
	if (RunService.IsStudio()) {
		warn(`[Network] Dropped ${name} from ${player.Name}: rate limit ${limiter.count}/${limiter.window}s`);
	}
	return false;
}

export function eventRateLimit<I extends readonly unknown[]>(
	count: number,
	window: number,
): Networking.EventMiddleware<I> {
	return (processNext, event) => {
		const limiter = track(new RateLimit(count, window));
		return (player, ...args) => {
			if (allow(limiter, event.name, player)) {
				processNext(player, ...args);
			}
		};
	};
}

export function functionRateLimit<I extends readonly unknown[], O>(
	count: number,
	window: number,
): Networking.FunctionMiddleware<I, O> {
	return (processNext, event) => {
		const limiter = track(new RateLimit(count, window));
		return (player, ...args) => {
			if (!allow(limiter, event.name, player)) {
				return Networking.Skip;
			}
			return processNext(player, ...args);
		};
	};
}
