import { ScreenDefinition } from "./types";

export const screens = {} satisfies Record<string, ScreenDefinition>;

export type ScreenName = keyof typeof screens;
