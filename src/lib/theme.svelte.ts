/**
 * Theme preference store for the public reading experience.
 *
 *   "auto"  → follow OS preference (default)
 *   "light" → force light
 *   "dark"  → force dark
 *
 * Persisted to localStorage so the choice survives refreshes. The actual
 * `data-theme` attribute is written to <html> by the layout init code so
 * SSR + hydration don't flash the wrong colors.
 */
const STORAGE_KEY = 'smp1a-theme';
type Pref = 'auto' | 'light' | 'dark';

function readSaved(): Pref {
	if (typeof localStorage === 'undefined') return 'auto';
	const v = localStorage.getItem(STORAGE_KEY);
	return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto';
}

function osPrefersDark(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function effectiveTheme(pref: Pref): 'light' | 'dark' {
	if (pref === 'auto') return osPrefersDark() ? 'dark' : 'light';
	return pref;
}

function applyToDocument(pref: Pref) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', effectiveTheme(pref));
}

class ThemeStore {
	pref = $state<Pref>('auto');
	resolved = $state<'light' | 'dark'>('light');

	hydrate() {
		this.pref = readSaved();
		this.resolved = effectiveTheme(this.pref);
		applyToDocument(this.pref);

		// React to OS-level changes when the user is on "auto".
		if (typeof window !== 'undefined' && window.matchMedia) {
			const mq = window.matchMedia('(prefers-color-scheme: dark)');
			const onChange = () => {
				if (this.pref === 'auto') {
					this.resolved = effectiveTheme('auto');
					applyToDocument('auto');
				}
			};
			mq.addEventListener?.('change', onChange);
		}
	}

	set(value: Pref) {
		this.pref = value;
		this.resolved = effectiveTheme(value);
		applyToDocument(value);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, value);
		}
	}

	/** Cycle: light → dark → auto → light. */
	cycle() {
		const next: Pref = this.pref === 'light' ? 'dark' : this.pref === 'dark' ? 'auto' : 'light';
		this.set(next);
	}
}

export const theme = new ThemeStore();
