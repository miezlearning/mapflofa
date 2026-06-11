// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '$lib/db/schema';

declare global {
	namespace App {
		interface Locals {
			/** Authenticated user attached by hooks.server.ts. null when not signed in. */
			user: User | null;
			/** sha256(token) — useful for logout / "current session" lookups. */
			sessionId: string | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
