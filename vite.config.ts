import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	// Use import.meta.env for Vite environment variables
	const allowedHosts = (import.meta.env?.VITE_ALLOWED_HOSTS ?? '')
		.split(',')
		.map((host) => host.trim())
		.filter(Boolean);

	// Always allow localhost and 127.0.0.1
	const defaultHosts = ['localhost', '127.0.0.1'];
	for (const host of defaultHosts) {
		if (!allowedHosts.includes(host)) {
			allowedHosts.push(host);
		}
	}

	// Add specific tunneling domains for development
	const tunnelDomains = [
		'pearl-canyon-6d4c00cb.tunnl.gg',
		'keen-wave-1a2ec6b5.tunnl.gg'
	];
	for (const domain of tunnelDomains) {
		if (!allowedHosts.includes(domain)) {
			allowedHosts.push(domain);
		}
	}

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: allowedHosts.length > 0 ? { allowedHosts } : undefined,
		test: {
			environment: 'node',
			include: ['src/**/*.test.ts']
		}
	};
});
