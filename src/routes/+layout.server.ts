import type { LayoutServerLoad } from './$types';
import { profileRepo } from '$lib/server/repositories/profile';
import { newsRepo } from '$lib/server/repositories/news';

/**
 * Root layout server load — provides contact info & latest news to all pages
 * so the Footer component can be fully dynamic and real.
 */
export const load: LayoutServerLoad = async () => {
	const [content, newsResult] = await Promise.all([
		profileRepo.getContentMap().catch(() => ({})),
		newsRepo.list({ limit: 3, offset: 0 }).catch(() => ({ rows: [], total: 0 }))
	]);

	const extraContacts = (content['contact.extra'] ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [label, value] = line.split('|').map((s) => s.trim());
			return { label: label || '', value: value || '' };
		})
		.filter((c) => c.label && c.value);

	const socials = (content['contact.socials'] ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [platform, url] = line.split('|').map((s) => s.trim());
			return { platform: platform || '', url: url || '#' };
		})
		.filter((s) => s.platform && s.url);

	return {
		contact: {
			address: content['contact.address'] ?? '',
			whatsapp: content['contact.whatsapp'] ?? '',
			instagram: content['contact.instagram'] ?? '',
			email: content['contact.email'] ?? '',
			extra: extraContacts,
			socials
		},
		latestNews: (newsResult.rows ?? []).map((n) => ({
			id: n.id,
			title: n.title,
			slug: n.slug,
			category: n.category,
			createdAt: n.createdAt,
			publishedAt: n.publishedAt
		}))
	};
};
