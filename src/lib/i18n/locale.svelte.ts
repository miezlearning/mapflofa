/**
 * Tiny i18n store for the docs section.
 *
 * - Locale persists in localStorage so reload keeps the choice.
 * - During SSR, sessionStorage/localStorage are unavailable so we fall back
 *   to "id" (project's primary language). Hydration on the client picks up
 *   whatever was saved before.
 */
import { docsStrings, type DocsStringKey, type Locale } from './strings';

const STORAGE_KEY = 'smp1a-docs-lang';
const DEFAULT_LOCALE: Locale = 'id';

function readSaved(): Locale {
	if (typeof localStorage === 'undefined') return DEFAULT_LOCALE;
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw === 'id' || raw === 'en' ? raw : DEFAULT_LOCALE;
}

class LocaleStore {
	current = $state<Locale>(DEFAULT_LOCALE);

	hydrate() {
		this.current = readSaved();
	}

	set(value: Locale) {
		this.current = value;
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
	}

	/** Translate a UI string key. */
	t(key: DocsStringKey): string {
		return docsStrings[this.current][key] ?? docsStrings.en[key] ?? key;
	}

	/** Translate a `{ id, en }` object pulled from the registry. */
	tr(value: { id: string; en: string } | string): string {
		if (typeof value === 'string') return value;
		return value[this.current] ?? value.en ?? '';
	}
}

export const locale = new LocaleStore();
export type { Locale };
