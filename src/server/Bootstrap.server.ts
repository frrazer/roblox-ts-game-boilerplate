import { Flamework } from "@flamework/core";
import { stripEditorOnly } from "./utils/EditorOnly";

stripEditorOnly();

Flamework.addPaths("src/server/services");
Flamework.ignite();

script.SetAttribute("Ready", true);
