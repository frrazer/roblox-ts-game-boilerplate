import { GlobalEvents, GlobalFunctions } from "shared/network";
import { eventRateLimit, functionRateLimit } from "./utils/networkRateLimit";

export const Events = GlobalEvents.createServer({
	middleware: {
		data: {
			start: [eventRateLimit(1, 5)],
		},
	},
});

export const Functions = GlobalFunctions.createServer({
	middleware: {
		ping: [functionRateLimit(5, 1)],
	},
});
