import { describe, expect, it } from 'vitest';
import { parseId } from './parse';

describe('parseId', () => {
	it('accepts positive integer strings', () => {
		expect(parseId('1')).toBe(1);
		expect(parseId('42')).toBe(42);
	});

	it('rejects missing, malformed, zero, and negative ids', () => {
		expect(parseId(undefined)).toBeNull();
		expect(parseId('')).toBeNull();
		expect(parseId('abc')).toBeNull();
		expect(parseId('1.5')).toBeNull();
		expect(parseId('0')).toBeNull();
		expect(parseId('-3')).toBeNull();
	});

	it('rejects unsafe integers', () => {
		expect(parseId(String(Number.MAX_SAFE_INTEGER + 1))).toBeNull();
	});
});
