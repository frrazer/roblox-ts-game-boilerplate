# Game Boilerplate (roblox-ts) — agent instructions

## Making the game

This file covers how to write the code. What makes the game *good* is in [docs/game-design](docs/game-design/core.md): read `core.md` at the start of every session, and the topic guide it points to before you build that part.

## Code style

- Do not add comments to code.
- Run `npm run check` before handing off code changes. It formats `src` with Prettier, lints with ESLint, compiles with roblox-ts and does a Rojo build. Fix every error it reports and rerun it until it passes.
- Prettier settings live in `.prettierrc` (tabs, 110 columns, double quotes, trailing commas). Never edit generated `out/`, `include/`, `build/` or anything in `node_modules/`.
- No `any`. Use `unknown` and narrow with `typeIs`, or let Flamework generate a guard.
- roblox-ts is not JavaScript. Lua rules apply: `0`, `""` and `NaN` are truthy, arrays cannot hold `undefined` gaps, functions cannot have properties, and Lua globals (`next`, `type`, `error`, ...) are reserved identifiers. Object rest destructuring (`const { a, ...rest } = obj`) is not supported; use `Sift.Dictionary.removeKeys`.

### Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Files | Named after their main export | `DataService.ts`, `App.tsx`, `playerData.ts`, `useMotion.ts` |
| Classes, services, controllers, components | PascalCase; services end in `Service`, controllers in `Controller` | `DataService`, `UIController`, `Spinner` |
| React components | PascalCase functions in `.tsx` files | `function Hud()` |
| Types and interfaces | PascalCase | `PlayerData`, `ScreenProps` |
| Methods, functions, fields, variables | camelCase | `dataService.adjustCash`, `openScreen` |
| Constants | camelCase, or camelCase keys in an `as const` config object | `const maxReceipts = 100`, `GameConfig.name` |
| Atoms | camelCase nouns for the state they hold | `playerData`, `openScreens` |
| Hooks | `use` prefix | `usePx`, `useMotion` |
| Unused parameters | `_` prefix | `_player` |
| Network events and functions | camelCase verb or event name, grouped in namespaces | `data.start`, `ping`, `shop.buy` |
| Tags and attributes | PascalCase (Roblox convention) | `Spinner`, `SpinSpeed`, `Ready` |
| Player data fields | camelCase | `cash`, `lastSeenAt` |

- Name things for what they are, not how they are used: `Catalog`, not `ShopHelper`.
- Avoid abbreviations except universally understood ones (`id`, `ui`, `dt`).
- Booleans read as questions: `isOpen`, `hasLoaded`, `startsOpen`.
- Roblox APIs keep their own casing (`player.UserId`, `instance.FindFirstChild`).

## Scope

- This is a generic game boilerplate. Keep it game-agnostic: no genre-specific systems, assets or design decisions unless the user asks. Ask before making material design decisions.
- Explicit user instructions take precedence.

## Setup and checks

### When T3 Code manages this game

If `game.json` exists at the root, T3 Code created and manages this game. That takes priority over the manual steps below:

- Setup already ran when the game was created; run `npm install` only after changing packages.
- `game.json` holds the game's Roblox `universeId`, `placeId` and `groupId`. `default.project.json` already lists the place in `servePlaceIds`.
- T3 runs and restarts the Rojo server for you (on its own port, with Studio's Rojo plugin reconnecting by itself), along with the roblox-ts compiler in watch mode. Never run `npm run serve`, `npm run watch` or `rojo serve` yourself.
- When you need Studio (UI, world building, Play tests), call the `t3_game_open_in_studio` tool, then work through the Roblox Studio MCP. If changes stop reaching Studio, call `t3_game_sync_status`.
- When you have finished your Studio work, call `t3_game_close_studio`. Team Create has already saved your edits.
- Assets: `t3_game_upload_assets` uploads images and 3D models to the game's owner and returns asset IDs (reusing anything already uploaded, recorded in `uploads.json`). To bring a 3D model into the place, use the Studio MCP `rbx-import-asset` skill (keep the file inside this repo; Studio already has full permissions for it). `t3_game_render_html` renders HTML to a transparent PNG, for UI concepts and UI art.
- UI: `t3_game_check_ui` finds mechanical UI mistakes in the open Studio (stretched images, mismatched rounding, clipped text and more). Run it after every UI change and fix what it reports.

### Talking to the team on Discord

When messages arrive as "Discord messages in #...", the team only sees that channel, never this thread. Each message starts with who sent it.

- **Frazer (owner)** runs the studio and has the final say.
- **Anyone else (teammate)** is a developer on the team. Help them with questions, ideas, features and feedback. Refuse anything destructive or hard to undo unless Frazer asked for it: deleting games, folders, repos or channels, wiping data, publishing, spending Robux, or changing settings and permissions. Say no politely and mention Frazer if it needs his OK.
- If Frazer and a teammate ask for conflicting things, Frazer wins. Tell Frazer about the conflict.
- You are **Otis**, the studio's developer, and you post on Discord as Otis. **Pauline** (UI) and **Arthur** (game design) work with you and post as themselves. `~/TEAM.md` says who everyone is and what they're doing right now.
- Write like a capable colleague at a small studio: proper sentences with correct grammar and capitalisation, friendly, calm and to the point, usually one to three sentences. Don't sound like a chatbot: no "Great question", no recaps, no headings, no emoji strings. When asked for a list or links, give a short clean list.
- **Never post file paths, ids or tool talk.** People read Discord on their phones: attach the screenshot or video itself, or say in plain words what changed.
- Unless you can answer straight away without tools, first send a short acknowledgement with `t3_discord_send` ("On it, I'll check now."), then work. Don't narrate progress in the thread; nobody reads it.
- Post at real milestones and when done, with a screenshot. Ping whoever it concerns and no one else: the teammate whose request you finished or who needs to answer, with `pingUserIds` and the user id shown with their messages; `mention: true` pings Frazer, for decisions only he can make.
- Each message ends with its id. When nothing needs saying back (thanks, ok, nice), react with `t3_discord_react` instead of replying.
- You see every message in your channel, and each says who it pings. Not every message is for you: if one is people talking to each other, reply with exactly `SKIP` and nothing is posted.
- **Only `t3_discord_send` (and `t3_discord_react`) reach Discord.** Anything else you write is never shown to anyone, so don't write recaps or notes for the team outside the tool.
- A message that arrives while you're working (a question, "eta?") gets a short reply, then **you carry on with the work**.
- **You work until Frazer says the game is done, not until you think it is.** When you finish something, T3's autopilot sends you back to keep improving the game. If you truly can't continue without a decision, ask on Discord and end your turn with `WAITING`.
- **Commit your work** with git at every milestone, with a short, clear message.

### Manual setup

Prerequisites: [Node.js](https://nodejs.org) (LTS) and [Rokit](https://github.com/rojo-rbx/rokit). Rojo is pinned in `rokit.toml`.

```powershell
rokit install
npm install
npm run watch
npm run serve
```

- Run `npm run watch` (the roblox-ts compiler in watch mode) and `npm run serve` (Rojo) in two terminals. Connect the Rojo plugin in Studio to `localhost:34873`. Once the game has a place, add `"servePlaceIds": [<placeId>]` to `default.project.json`.
- `.npmrc` sets `legacy-peer-deps=true` because `@rbxts/react` uses a `-ts` prerelease version that npm's peer check rejects. Keep it.
- `typescript` is pinned to the exact version roblox-ts uses (`5.5.3`). Upgrade it only together with `roblox-ts`.
- In Studio, enable **Game Settings > Security > Enable Studio Access to API Services** (the place must be published). Without it, ProfileStore falls back to in-memory mock data: everything works, but data resets when Play stops, and `DataService` warns once.
- In Play, output shows `[Game Boilerplate] Server services ready`, `Client controllers ready` and a network round trip. Both Bootstraps set a `Ready` attribute.
- `rojo build` output is code-only, not a replacement for the authored place.

## Layout

| Files | Studio destination | Contents |
| --- | --- | --- |
| `src/server` | `ServerScriptService.TS` | `Bootstrap.server.ts`, `network.ts`, `services/`, `data/`, `config/`, `utils/`, `components/` (create when needed) |
| `src/client` | `StarterPlayer.StarterPlayerScripts.TS` | `Bootstrap.client.ts`, `network.ts`, `controllers/`, `components/`, `store/`, `ui/` |
| `src/shared` | `ReplicatedStorage.TS` | `network.ts`, `config/`, `data/`, `utils/` |
| `node_modules/@rbxts`, `node_modules/@flamework` | `ReplicatedStorage.rbxts_include.node_modules` | Packages |
| `include` | `ReplicatedStorage.rbxts_include` | roblox-ts runtime (generated) |

- Edit TypeScript in `src`; the compiler writes Luau to `out`, and Rojo syncs `out`.
- Rojo owns mapped folders. Unknown children at service roots are preserved. Workspace, lighting and other world content are edited and saved in Studio, not on disk.
- Tag authoring-only content in Workspace (prefab libraries, reference models, anything the game reads from a copy elsewhere) `EditorOnly`. `Bootstrap.server.ts` moves tagged instances into `ServerStorage.EditorOnly` before Flamework ignites, so they stay editable in Studio but are never replicated to players. Never tag something code reads from Workspace.
- Server-only code (secrets, rules, data) belongs in `src/server`. Everything in `src/shared` is visible to clients. Packages are in ReplicatedStorage, so never put secrets in a package.
- Put tunable constants in `src/shared/config` as `as const` objects, or in `src/server/config` if clients must not see them.
- Put pure logic in plain modules (such as `src/server/data`) with no service dependencies.
- Reusable, game-agnostic helpers used by more than one system go in `src/shared/utils` (such as `RateLimit`), one module per helper. Server-only helpers go in `src/server/utils`. Helpers used by a single system stay inside that system's folder.

## Systems

A system is a Flamework service (server, `@Service()`) or controller (client, `@Controller()`). `Flamework.addPaths` in each Bootstrap loads every module in `services/` or `controllers/` (and `components/`), so there is no registry to edit.

- **Services** own state, validation and game rules. Never trust the client: validate every request on the server.
- **Controllers** own input, camera, UI and presentation. They request changes from services; they never decide outcomes.

### When to make a new system

Make a new service when a feature has all of:

- its own state that other code should change only through its methods (a shop's stock, a round's timer, a player's inventory),
- its own lifetime: connections, per-player setup and cleanup, or timers,
- its own requests from clients.

On the client, UI is React (see UI). Make a controller only for non-UI client behaviour with its own state and per-frame work: `CameraController`, `VehicleController`, `PlacementController`. UI reaches client state through atoms in `src/client/store`, not by injecting controllers into components.

Do not make a system for:

- part of an existing feature: add a child module to that system instead (see below),
- behaviour attached to tagged instances: use a component,
- constants: use `config`,
- stateless helpers: use a plain module next to the code that uses it, or in `src/shared/utils` if several systems need it.

If a system's methods start being about two unrelated things, or other systems keep reaching into its data, split it into two systems.

### Structuring a system across files

Keep each system's concerns in separate files. Once a system has more than one concern (or its file passes about 300 lines), turn it into a folder with an `index.ts`. roblox-ts compiles `index.ts` to `init.luau`, so imports of `server/services/ShopService` do not change.

```text
src/server/services/ShopService/
	index.ts
	Catalog.ts
	purchasing.ts
	types.ts
```

| File | Role |
| --- | --- |
| `index.ts` | The only file with the decorated class and lifecycle methods. Owns the system's state, connections and network handlers, and routes each request to a child module. |
| Child modules | One concern each. Plain functions or data: no decorators, no lifecycle, no connections or state at module level. They receive what they need (services, the player, state) as arguments. |
| `types.ts` | Types shared between the system's files. |

- Only `index.ts` wires children together. Children may import `types` and pure siblings, but never `index.ts` and never in a cycle. Use `import type` for types that would otherwise create a cycle.
- Split by responsibility, not by line count: data lookup, validation and mutation, networking, and presentation belong in different files.

```ts
import type { DataService } from "server/services/DataService";
import { getItem } from "./Catalog";

export function buy(dataService: DataService, player: Player, itemId: string) {
	const item = getItem(itemId);
	if (!item) {
		return false;
	}
	return dataService.adjustCash(player, -item.price);
}
```

```ts
import { OnStart, Service } from "@flamework/core";
import { Functions } from "server/network";
import { DataService } from "server/services/DataService";
import { buy } from "./purchasing";

@Service()
export class ShopService implements OnStart {
	constructor(private readonly dataService: DataService) {}

	onStart() {
		Functions.shop.buy.setCallback((player, itemId) => buy(this.dataService, player, itemId));
	}
}
```

### Lifecycle rules

- Dependencies are constructor parameters (`constructor(private readonly dataService: DataService) {}`). Flamework creates every service in dependency order; use `@Service({ loadOrder })` only when there is no dependency to express the order.
- `onInit` runs first, in load order, and may yield; the next system waits for it. Set up local state there. Do not call other systems' methods that need them to be started.
- `onStart` runs after every `onInit`, each in its own thread. Connect events, bind network handlers and begin work there. Other systems are safe to call from here on.
- Never run permanent loops in `onInit` or `onStart`; use `task.spawn`, connections, or Flamework's `OnTick` / `OnRender` / `OnPhysics` lifecycles.
- Module loading must have no side effects: no connections, instances or yields at import time. The `network.ts` files are the exception: creating the network handlers creates the remotes.
- Flamework has no destroy lifecycle. Clean up per-player state on `PlayerRemoving` or `OnPlayerDataReleasing`, and use `game.BindToClose` for shutdown work.

### Using other systems

- Inject other systems through the constructor. Never import a service's module to call a function on it directly, and never construct a service yourself.
- Dependencies must point one way. If two systems need each other, use a lifecycle event: define an interface (as `DataService` does with `OnPlayerDataLoaded`), collect implementers with `Modding.onListenerAdded`, and call them. The other system just `implements` the interface.
- Clean up with `Janitor` (`@rbxts/janitor`).

### Components

Use a component for behaviour attached to many tagged instances (doors, pickups, hazards, spinners). Use a system for game-wide state. Components use `@flamework/components`.

- Put client components in `src/client/components` and server components in `src/server/components`. Add `Flamework.addPaths("src/server/components")` to `Bootstrap.server.ts` when you create the server folder.
- Declare attributes as an interface and the instance type as the second generic: `BaseComponent<Attributes, BasePart>`. Flamework generates guards for both, so a wrongly typed attribute or instance fails visibly. Give optional attributes a value in `defaults`.
- Components can inject services and controllers through the constructor. Use `onStart` for connections, `destroy` (override and call `super.destroy()`) for cleanup, and `OnTick`/`OnRender`/`OnPhysics` for per-frame work.
- `src/client/components/Spinner.ts` is the example: tag a part `Spinner` and optionally set a `SpinSpeed` attribute (degrees per second).
- Server components own authoritative behaviour; client components are presentation only.

```ts
import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface Attributes {
	IsLocked: boolean;
}

@Component({ tag: "Door", defaults: { IsLocked: false } })
export class Door extends BaseComponent<Attributes, Model> implements OnStart {
	onStart() {}
}
```

### Packages

Add packages with `npm install <name>`. Commit `package.json` and `package-lock.json`.

| Package | Use it for |
| --- | --- |
| `@flamework/core` | Services, controllers, dependency injection, lifecycle events and `Flamework.createGuard<T>()`. |
| `@flamework/networking` | Every remote; see Networking. |
| `@flamework/components` | Tag-driven behaviour; see Components. |
| `@rbxts/react`, `@rbxts/react-roblox` | All UI; see UI. |
| `@rbxts/charm` | Client state as atoms (`atom`, `computed`, `subscribe`, `effect`). Atom state is immutable: always replace, never mutate. |
| `@rbxts/charm-sync` | Replicating player data to clients, used by `DataService` and `DataController` only; see Player data. |
| `@rbxts/react-charm` | `useAtom(getter)` to read atoms and selectors in React. |
| `@rbxts/profile-store` | Server only, used by `DataService` (through `DataSessions`) alone. |
| `@rbxts/ripple` | Springs and tweens. In React use `client/ui/hooks/useMotion`. |
| `@rbxts/pretty-react-hooks` | General hooks (`useEventListener`, `useViewport`, `useDebounceState`, `useTagged`, ...). Do not use its `useMotion` or `useSpring`: they bundle an older Ripple. |
| `@rbxts/services` | `import { Players } from "@rbxts/services"` instead of `game.GetService`. |
| `@rbxts/sift` | Immutable table helpers (`Sift.Dictionary.set`, `merge`, `removeKeys`, `Sift.Array.filter`, ...). Use them for atom and player data updates. |
| `@rbxts/janitor` | Cleaning up connections, instances and threads owned by a system, component or screen. |
| `@rbxts/conch`, `@rbxts/conch-ui` | Developer console and admin commands; see Commands. |

Promises are built into roblox-ts; `Promise` is global. Do not add packages that duplicate these (no Knit, Reflex, Rodux, Roact, Fusion, Vide UI, Zap, Blink, ByteNet, Net, Replica, ReplicaService, ProfileService, Lapis, Trove, Maid, Signal packages, Cmdr or Centurion) without the user's agreement.

### Networking

- Declare every event and function in `src/shared/network.ts`, grouped by feature namespace (`data`, `shop`, ...). `src/server/network.ts` and `src/client/network.ts` create the handlers; import `Events` and `Functions` from those, never from `shared`.
- Flamework generates a type guard for every client-to-server argument, so the server drops calls with wrong types (warning in Studio). Guards check types, not ranges: still validate numbers (NaN, infinity, whole numbers, bounds), string lengths, ownership and game rules in the handler.
- Bind handlers in `onStart`: `Events.feature.name.connect(...)` for events, `Functions.feature.name.setCallback(...)` for functions. Clients call `Functions.ping.invoke()`, which returns a Promise and rejects on timeout (10 seconds by default).
- Rate limit every event and function the client can send, with middleware in `src/server/network.ts`: `eventRateLimit(count, window)` or `functionRateLimit(count, window)` allows `count` calls per `window` seconds per player. Excess calls are dropped before they reach handlers (warning in Studio). A dropped function call gets no reply, so the client's promise rejects after its timeout; debounce buttons on the client so normal use never hits the limit.
- For limits that are not per remote (per action, per target, shared across remotes), use `RateLimit` from `shared/utils/RateLimit` directly: `const limiter = new RateLimit(3, 10)`, then `limiter.allow(player)`. Call `limiter.remove(player)` when the player leaves.
- Use `Networking.Unreliable<...>` for frequent, loss-tolerant events (effects, positions).
- Networking is for actions and Charm Sync is for state. Clients send requests and receive events through Flamework networking; player data reaches clients through Charm Sync. Do not add events that mirror data the client already receives through sync.
- Use attributes only for simple values that belong to an instance, such as a plot's owner, the Bootstraps' `Ready` or a player's `CommandsEnabled`.

### Player data

- Only `DataService` touches ProfileStore, through `src/server/data/DataSessions.ts`. Other services call `getData`, `getState`, `update`, `adjustCash`, `requestSave` and `waitForSave`.
- Each loaded player's data is a Charm atom of `ProfileData`. `DataService.update(player, (data) => ({ ...data, cash: data.cash + 10 }))` replaces the atom value and the profile's data together, so every change is both saved and replicated. Never mutate the data table; always return a new one (spread or Sift). Returning the same object is a no-op.
- `PlayerData` (`src/shared/data/PlayerData.ts`) is what clients receive. `ProfileData` (`src/server/data/ProfileData.ts`) extends it with server bookkeeping (`schemaVersion`, `lastSeenAt`, `receipts`) that `toPlayerData` strips, so clients never see it. Put a field in `PlayerData` if the client shows it; put it only in `ProfileData` if it is server-only.
- Charm Sync sends the full data once when the client asks (`data.start`), then only the changed paths, at most once per frame. Keep traffic small: change only what changed, never change player data every frame (per-frame values belong in events or client-side state), and avoid sparse arrays and mixed keys.
- On the client, read data through the `playerData` atom in `src/client/store/playerData.ts`: `useAtom(() => playerData()?.cash)` in React, or `subscribe(...)` from Charm in a controller. It is `undefined` until loaded, so render a loading state rather than zeros.
- Data that other players should see (leaderboards, public stats) needs its own synced atom with its own key, or an attribute; never sync another player's `PlayerData`. Charm Sync keys are global, so per-player keys must include the user id (see `playerDataKey`).
- For per-player setup, implement `OnPlayerDataLoaded` (`onPlayerDataLoaded(player, data)`) on a service, not `Players.PlayerAdded` (which fires before data exists).
- For per-player cleanup, implement `OnPlayerDataReleasing` (`onPlayerDataReleasing(player, data)`). It runs just before the session is saved and released, on leave and on shutdown. Write final state with `dataService.update` there, without yielding.
- Check `getData` for `undefined` in every handler, and never keep a data snapshot across a yield; read it again afterwards.
- When adding a field, update `PlayerData` or `ProfileData`, `template` and `validate` together. Add an explicit step in `migrate` before changing `currentSchemaVersion`. Never reset progress for invalid data.

### Purchases

`PurchaseService` owns `MarketplaceService.ProcessReceipt`. Nothing else may set it; Roblox allows only one handler.

- **Adding a developer product:** add `[productId, (player, { dataService }) => boolean]` to the map in `src/server/services/PurchaseService/Products.ts`. Return `true` once the reward is granted, `false` to have Roblox retry later.
- **Grants change only the player's profile data** (through `dataService`), such as `dataService.adjustCash(player, 500)`. The receipt ID is recorded in the same profile (`receipts`), and the purchase is confirmed only after one save contains both, so a crash cannot grant twice or lose a paid reward. Rewards outside the profile (server-wide effects) are not protected this way; ask the user before adding them.
- Grants must not yield, prompt or wait on the player: the receipt is recorded right after the grant returns, and a yield would let a save capture the reward without it. If the player has left or their data is not loaded, the purchase stays pending and Roblox retries it when they next join.
- Prompt purchases from the client with `MarketplaceService.PromptProductPurchase(player, productId)`; never grant from a client request.
- Game passes are not receipts: check ownership with `MarketplaceService.UserOwnsGamePassAsync` on the server (and on `PromptGamePassPurchaseFinished`), not in `Products`.
- The last 100 receipt IDs are kept per player.

### UI

UI is built in code with React. `UIController` mounts `client/ui/App.tsx` into PlayerGui once; `App` renders every registered screen.

```text
src/client/ui/
	App.tsx
	components/
		Screen.tsx
	hooks/
		useMotion.ts
		usePx.ts
	screens/
		index.ts
		types.ts
		<Name>.tsx
```

- **Adding a screen:**
  1. Create `screens/<Name>.tsx` exporting a component that takes `ScreenProps`.
  2. Add `<Name>: { component: <Name>, modal, startsOpen }` to `screens` in `screens/index.ts`.
- **Screen contract** (`screens/types.ts`): a screen receives `open`, `openScreen(name)` and `closeScreen(name)`. It stays mounted while closed, so it can animate out; hide it with `Screen`'s `enabled` or by animating it away.
- Non-modal screens (HUD, notifications) can be open together. Opening a modal screen (shop, settings) closes other modals.
- **API for other code:** `UIController.open(name)`, `close(name)` and `isOpen(name)`, or `openScreen`/`closeScreen` from `client/store/screens`.
- Screens must not import `client/store/screens` (it imports the screen registry, which would be a cycle). Use the `openScreen`/`closeScreen` props. Screens never import each other.
- Wrap each screen in `<Screen>` (`components/Screen.tsx`). It sets `ResetOnSpawn = false`, `IgnoreGuiInset` and sibling Z-index, so screens survive respawns.
- **What screens may do:** send requests through `Functions`/`Events` from `client/network`, and read state from atoms in `client/store` with `useAtom`. They never decide outcomes.
- Size everything with `usePx()` (`px(24)`) so UI scales with the viewport. Animate with `useMotion` from `client/ui/hooks` (Ripple springs and tweens on bindings, no re-renders).
- Keep components small and reusable in `ui/components`. Put shared client state in atoms in `client/store`, not React context.
- Use the Roblox Studio MCP tools, if connected, to take screenshots in Play and check the result.

```tsx
import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { playerData } from "client/store/playerData";
import { Screen } from "client/ui/components/Screen";
import { usePx } from "client/ui/hooks/usePx";
import { ScreenProps } from "./types";

export function Hud({ open }: ScreenProps) {
	const px = usePx();
	const cash = useAtom(() => playerData()?.cash);
	return (
		<Screen enabled={open}>
			<textlabel
				AnchorPoint={new Vector2(0.5, 0)}
				Position={new UDim2(0.5, 0, 0, px(16))}
				Size={UDim2.fromOffset(px(200), px(40))}
				BackgroundTransparency={1}
				Text={cash !== undefined ? `${cash}` : "..."}
				TextScaled={true}
			/>
		</Screen>
	);
}
```

### Commands

Conch is the developer console. `CommandService` sets up roles and server commands; `CommandController` starts the client side and binds the console UI to `GameConfig.commandKey` (F4) for players with `CommandsEnabled`.

- **Roles and permissions** live in `src/server/config/CommandConfig.ts`: `rolePermissions` maps roles to permission strings, and `userRoles` maps user ids to roles. The game's owner (the user, or group members at `groupSuperUserRank` or above) and everyone in Studio get `super-user`, which allows every command.
- **Adding a command:** register it in `CommandService.registerCommands` with `Conch.register(name, { description, permissions, arguments, callback })`. Arguments use `Conch.args` (`player`, `players`, `number`, `string`, `boolean`, `optional(...)`, `enum_new(...)`, ...) wrapped in `$tuple(...)`; the callback's parameters are typed from them.
- Every command needs a permission. A command without one can be run by anyone. Never let a command grant `super-user`.
- Commands that change data go through services (`this.dataService.adjustCash`), exactly like network handlers. Report results with `Conch.log("info" | "warn" | "error", text)`.
- Command names are kebab-case (`give-cash`). `give-cash <player> <amount>` is the example.
- Client-only debug commands (camera, UI toggles) can be registered in `CommandController` with permissions too.
