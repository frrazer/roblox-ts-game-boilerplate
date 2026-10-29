import { OnStart, Service } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";
import { DataService } from "server/services/DataService";
import { products, PurchaseContext } from "./Products";

const maxReceipts = 100;

function addReceipt(receipts: Readonly<Record<string, number>>, purchaseId: string, grantedAt: number) {
	const nextReceipts: Record<string, number> = { ...receipts, [purchaseId]: grantedAt };
	const ids = new Array<string>();
	for (const [id] of pairs(nextReceipts)) {
		ids.push(id);
	}
	if (ids.size() <= maxReceipts) {
		return nextReceipts;
	}
	ids.sort((a, b) => nextReceipts[a] < nextReceipts[b]);
	for (const index of $range(0, ids.size() - maxReceipts - 1)) {
		delete nextReceipts[ids[index]];
	}
	return nextReceipts;
}

@Service()
export class PurchaseService implements OnStart {
	private readonly context: PurchaseContext;

	constructor(private readonly dataService: DataService) {
		this.context = { dataService };
	}

	onStart() {
		MarketplaceService.ProcessReceipt = (receipt) => this.processReceipt(receipt);
	}

	private processReceipt(receipt: ReceiptInfo) {
		const purchaseId = tostring(receipt.PurchaseId);
		const player = Players.GetPlayerByUserId(receipt.PlayerId);
		const state = player && this.dataService.getState(player);
		if (!player || !state) {
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}
		if (state().receipts[purchaseId] === undefined) {
			const grant = products.get(receipt.ProductId);
			if (!grant) {
				warn(`[PurchaseService] No grant for product ${receipt.ProductId}`);
				return Enum.ProductPurchaseDecision.NotProcessedYet;
			}
			const [ok, granted] = pcall(grant, player, this.context);
			if (!ok) {
				warn(`[PurchaseService] Grant for product ${receipt.ProductId} failed: ${granted}`);
				return Enum.ProductPurchaseDecision.NotProcessedYet;
			}
			if (granted !== true || this.dataService.getState(player) !== state) {
				return Enum.ProductPurchaseDecision.NotProcessedYet;
			}
			this.dataService.update(player, (data) => ({
				...data,
				receipts: addReceipt(data.receipts, purchaseId, os.time()),
			}));
		}
		const saved = this.dataService.waitForSave(
			player,
			(snapshot) => snapshot.receipts[purchaseId] !== undefined,
		);
		return saved
			? Enum.ProductPurchaseDecision.PurchaseGranted
			: Enum.ProductPurchaseDecision.NotProcessedYet;
	}
}
