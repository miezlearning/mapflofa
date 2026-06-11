/**
 * Privacy-friendly page view tracking.
 *
 * Storage: visitor_hash = sha256(ip + ua + dailySalt)
 *   - Same visitor on the same UTC day → identical hash (so we can count
 *     "unique visitors" without storing IP).
 *   - Different day or different IP/UA → different hash.
 *   - Salt is per-process random + day. The salt is not persisted, so old
 *     hashes can never be reversed even with full DB + code access.
 *
 * Bot filter: skip common known crawlers via UA regex. Cheap heuristic;
 * for production-grade fanatic accuracy, plug in a list later.
 */
import type { RequestEvent } from '@sveltejs/kit';
import { createHash, randomBytes } from 'node:crypto';
import { db } from '$lib/db';
import { pageViews } from '$lib/db/schema';

const BOT_RE =
	/bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|googlebot|adsbot|petalbot|semrushbot|ahrefsbot|mj12bot|dotbot|seznambot|yandexbot|baiduspider/i;

const PROCESS_SALT = randomBytes(16).toString('hex');

function dailyKey(date = new Date()): string {
	return date.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

function hashVisitor(ip: string, ua: string): string {
	return createHash('sha256').update(`${ip}|${ua}|${dailyKey()}|${PROCESS_SALT}`).digest('hex');
}

function clientIp(event: RequestEvent): string {
	try {
		return event.getClientAddress() || 'unknown';
	} catch {
		return 'unknown';
	}
}

/**
 * Record a single page view.
 *
 * Designed to be called fire-and-forget from a `load` function; never
 * throws synchronously. Skips bots and admin/api routes.
 */
export async function recordPageView(event: RequestEvent, path: string): Promise<void> {
	if (path.startsWith('/admin') || path.startsWith('/api')) return;

	const ua = event.request.headers.get('user-agent') ?? '';
	if (!ua) return;
	if (BOT_RE.test(ua)) return;

	const ip = clientIp(event);
	const visitorHash = hashVisitor(ip, ua);
	const referer = event.request.headers.get('referer') ?? null;

	try {
		await db.insert(pageViews).values({
			path,
			visitorHash,
			referer
		});
	} catch (err) {
		console.error('[analytics] insert failed', err);
	}
}
