/**
 * Password hashing using Node's built-in scrypt.
 * Cost factor ~64MB / hash; tunable via N below.
 *
 * Format stored in DB:  scrypt$N$r$p$<salt-hex>$<hash-hex>
 * That way we can change parameters later without breaking existing hashes.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
	password: string | Buffer,
	salt: string | Buffer,
	keylen: number,
	options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
	if (password.length < 8) throw new Error('Password must be at least 8 characters.');
	const salt = randomBytes(16);
	const hash = await scrypt(password, salt, KEY_LEN, PARAMS);
	return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parts = stored.split('$');
	if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
	const N = Number(parts[1]);
	const r = Number(parts[2]);
	const p = Number(parts[3]);
	const salt = Buffer.from(parts[4], 'hex');
	const expected = Buffer.from(parts[5], 'hex');
	if (!N || !r || !p || salt.length === 0 || expected.length === 0) return false;

	const candidate = await scrypt(password, salt, expected.length, {
		N,
		r,
		p,
		maxmem: 128 * 1024 * 1024
	});
	if (candidate.length !== expected.length) return false;
	return timingSafeEqual(candidate, expected);
}
