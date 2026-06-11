import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is not set. Make sure /etc/sveltekit_modern_school_profile/production.env is loaded by PM2.'
	);
}

const client = postgres(databaseUrl, {
	prepare: false
});

export const db = drizzle(client, { schema });

export { schema };

