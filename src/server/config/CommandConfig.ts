export const CommandConfig = {
	rolePermissions: {
		moderator: ["manage-data"],
	} as Readonly<Record<string, readonly string[]>>,
	userRoles: {} as Readonly<Record<number, readonly string[]>>,
	groupSuperUserRank: 255,
};
