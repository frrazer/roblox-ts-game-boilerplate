import { CollectionService, ServerStorage } from "@rbxts/services";

export const editorOnlyTag = "EditorOnly";

export function stripEditorOnly() {
	const tagged = CollectionService.GetTagged(editorOnlyTag);
	if (tagged.size() === 0) {
		return;
	}
	let storage = ServerStorage.FindFirstChild(editorOnlyTag);
	if (!storage) {
		storage = new Instance("Folder");
		storage.Name = editorOnlyTag;
		storage.Parent = ServerStorage;
	}
	for (const instance of tagged) {
		if (!instance.IsDescendantOf(ServerStorage)) {
			instance.Parent = storage;
		}
	}
}
