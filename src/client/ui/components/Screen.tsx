import React from "@rbxts/react";

interface ScreenProps extends React.PropsWithChildren {
	readonly enabled?: boolean;
	readonly displayOrder?: number;
}

export function Screen({ enabled = true, displayOrder = 0, children }: ScreenProps) {
	return (
		<screengui
			Enabled={enabled}
			DisplayOrder={displayOrder}
			IgnoreGuiInset={true}
			ResetOnSpawn={false}
			ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
		>
			{children}
		</screengui>
	);
}
