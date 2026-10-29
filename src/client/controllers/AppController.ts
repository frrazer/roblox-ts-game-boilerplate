import { Controller, OnStart } from "@flamework/core";
import { Functions } from "client/network";
import { GameConfig } from "shared/config/GameConfig";

@Controller()
export class AppController implements OnStart {
	onStart() {
		print(`[${GameConfig.name}] Client controllers ready`);
		const sentAt = os.clock();
		Functions.ping
			.invoke()
			.then(() =>
				print(
					`[${GameConfig.name}] Network round trip ${math.round((os.clock() - sentAt) * 1000)} ms`,
				),
			)
			.catch((err) => warn(`[${GameConfig.name}] Ping failed: ${err}`));
	}
}
