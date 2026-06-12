import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	// Hardcode allowed hosts including tunneling domains
	const allowedHosts = [
		'localhost',
		'127.0.0.1',
		'pearl-canyon-6d4c00cb.tunnl.gg',
		'keen-wave-1a2ec6b5.tunnl.gg'
	];

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: { allowedHosts },
		test: {
			environment: 'node',
			include: ['src/**/*.test.ts']
		}
	};
});
