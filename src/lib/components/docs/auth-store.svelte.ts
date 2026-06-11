/**
 * Tiny shared store for the docs bearer token.
 *
 * Token only lives in memory + sessionStorage (cleared on tab close).
 * NEVER use localStorage — we don't want it sticky across sessions.
 */
const KEY = 'smp1a-docs-token';

function read(): string {
	if (typeof sessionStorage === 'undefined') return '';
	return sessionStorage.getItem(KEY) ?? '';
}

function write(value: string) {
	if (typeof sessionStorage === 'undefined') return;
	if (value) sessionStorage.setItem(KEY, value);
	else sessionStorage.removeItem(KEY);
}

class TokenStore {
	value = $state('');

	hydrate() {
		this.value = read();
	}

	set(v: string) {
		this.value = v;
		write(v);
	}

	clear() {
		this.value = '';
		write('');
	}

	get isSet() {
		return this.value.length > 0;
	}
}

export const authToken = new TokenStore();
