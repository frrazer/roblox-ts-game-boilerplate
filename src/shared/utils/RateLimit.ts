interface Bucket {
	tokens: number;
	updatedAt: number;
}

export class RateLimit<K = Player> {
	private readonly buckets = new Map<K, Bucket>();

	constructor(
		readonly count: number,
		readonly window: number,
	) {
		assert(count >= 1 && count % 1 === 0, "RateLimit count must be a positive integer");
		assert(window > 0, "RateLimit window must be positive");
	}

	allow(key: K) {
		const now = os.clock();
		let bucket = this.buckets.get(key);
		if (!bucket) {
			bucket = { tokens: this.count, updatedAt: now };
			this.buckets.set(key, bucket);
		}
		bucket.tokens = math.min(
			this.count,
			bucket.tokens + ((now - bucket.updatedAt) * this.count) / this.window,
		);
		bucket.updatedAt = now;
		if (bucket.tokens < 1) {
			return false;
		}
		bucket.tokens -= 1;
		return true;
	}

	remove(key: K) {
		this.buckets.delete(key);
	}
}
