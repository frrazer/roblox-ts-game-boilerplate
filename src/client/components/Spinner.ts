import { BaseComponent, Component } from "@flamework/components";
import { OnRender } from "@flamework/core";

interface Attributes {
	SpinSpeed: number;
}

@Component({ tag: "Spinner", defaults: { SpinSpeed: 90 } })
export class Spinner extends BaseComponent<Attributes, BasePart> implements OnRender {
	onRender(dt: number) {
		this.instance.CFrame = this.instance.CFrame.mul(
			CFrame.Angles(0, math.rad(this.attributes.SpinSpeed * dt), 0),
		);
	}
}
