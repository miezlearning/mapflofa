import type { LayoutServerLoad } from './$types';
import { profileRepo } from '$lib/server/repositories/profile';
import { newsRepo } from '$lib/server/repositories/news';

/**
 * Root layout server load — provides contact info & latest news to all pages
 * so the Footer component can be fully dynamic and real.
 */
export const load: LayoutServerLoad = async () => {
	const contentMap: Record<string, string> = await profileRepo.getContentMap().catch(() => ({}));
	const newsResult = await newsRepo.list({ limit: 3, offset: 0 }).catch(() => ({ rows: [], total: 0 }));

	const extraContacts = (contentMap['contact.extra'] ?? '')
		.split('\n')
		.map((line: string) => line.trim())
		.filter(Boolean)
		.map((line: string) => {
			const [label, value] = line.split('|').map((s: string) => s.trim());
			return { label: label || '', value: value || '' };
		})
		.filter((c: { label: string; value: string }) => c.label && c.value);

	const socials = (contentMap['contact.socials'] ?? '')
		.split('\n')
		.map((line: string) => line.trim())
		.filter(Boolean)
		.map((line: string) => {
			const [platform, url] = line.split('|').map((s: string) => s.trim());
			return { platform: platform || '', url: url || '#' };
		})
		.filter((s: { platform: string; url: string }) => s.platform && s.url);

	return {
		contact: {
			address: contentMap['contact.address'] ?? '',
			whatsapp: contentMap['contact.whatsapp'] ?? '',
			instagram: contentMap['contact.instagram'] ?? '',
			email: contentMap['contact.email'] ?? '',
			extra: extraContacts,
			socials
		},
		latestNews: (newsResult.rows ?? []).map((n) => ({
			id: n.id,
			title: n.title,
			slug: n.slug,
			category: n.category,
			createdAt: n.createdAt,
			date: n.date
		}))
	};
};
