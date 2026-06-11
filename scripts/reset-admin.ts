/**
 * Script to reset admin password
 * Run with: npx tsx scripts/reset-admin.ts
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { users } from '$lib/db/schema';

const scrypt = promisify(scryptCb) as (
	password: string | Buffer,
	salt: string | Buffer,
	keylen: number,
	options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const N = 16384,
		r = 8,
		p = 1;
	const hash = await scrypt(password, salt, 64, { N, r, p, maxmem: 128 * 1024 * 1024 });
	return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client);

const newPassword = process.argv[2] || 'mapflofa123';

async function main() {
	console.log('🔐 Resetting admin password...');

	const normalizedEmail = 'admin@mapflofa.local';
	const passwordHash = await hashPassword(newPassword);

	const result = await db
		.update(users)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(users.email, normalizedEmail))
		.returning();

	if (result.length > 0) {
		console.log(`✅ Password updated for ${normalizedEmail}`);
		console.log(`   New password: ${newPassword}`);
	} else {
		console.log(`❌ User not found: ${normalizedEmail}`);
	}

	await client.end();
}

main().catch(async (err) => {
	console.error('❌ Failed:', err);
	await client.end();
	process.exit(1);
});