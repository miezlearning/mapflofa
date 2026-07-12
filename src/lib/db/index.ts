import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is not set. Make sure /etc/sveltekit_modern_school_profile/production.env is loaded by PM2.'
	);
}

const poolConnection = mysql.createPool(databaseUrl);

export const db = drizzle(poolConnection, { schema, mode: 'default' });

export { schema };
