import { useViewport } from "@rbxts/pretty-react-hooks";
import { useCallback, useState } from "@rbxts/react";
import { Workspace } from "@rbxts/services";

const baseResolution = new Vector2(1280, 832);
const minScale = 0.5;
const dominantAxis = 0.5;

function scaleFor(viewport: Vector2) {
	const width = math.log(viewport.X / baseResolution.X, 2);
	const height = math.log(viewport.Y / baseResolution.Y, 2);
	return math.max(2 ** (width + (height - width) * dominantAxis), minScale);
}

export function usePx() {
	const [scale, setScale] = useState(() =>
		scaleFor(Workspace.CurrentCamera?.ViewportSize ?? baseResolution),
	);
	useViewport((viewport) => setScale(scaleFor(viewport)));
	return useCallback((value: number) => math.round(value * scale), [scale]);
}
