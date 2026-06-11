import type { LayoutServerLoad } from './$types';
import { apiRegistry } from '$lib/server/api/registry';

export const load: LayoutServerLoad = async () => {
	// Hand the whole registry to the layout so the sidebar always knows
	// every resource. Server-loaded so client never sees the import path.
	return {
		registry: apiRegistry
	};
};
