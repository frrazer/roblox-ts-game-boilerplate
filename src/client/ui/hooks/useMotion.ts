import React, { useEffect, useMemo } from "@rbxts/react";
import { Animatable, createMotion, Motion, MotionOptions } from "@rbxts/ripple";

export function useMotion<T extends Animatable>(
	initialValue: T,
	options?: MotionOptions<T>,
): LuaTuple<[React.Binding<T>, Motion<T>]> {
	const motion = useMemo(() => createMotion<T>(initialValue, { start: true, ...options }), []);
	const [binding, setBinding] = React.useBinding(initialValue);
	useEffect(() => {
		const disconnect = motion.onChange((value) => setBinding(value));
		return () => {
			disconnect();
			motion.destroy();
		};
	}, []);
	return $tuple(binding, motion);
}
