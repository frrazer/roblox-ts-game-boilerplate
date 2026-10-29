import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import roblox from "eslint-plugin-roblox-ts";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["out", "include", "build", "node_modules", "*.mjs"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	roblox.configs.recommended,
	prettier,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"no-undef": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "always" }],
			"roblox-ts/no-user-defined-lua-tuple": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
			],
		},
	},
);
