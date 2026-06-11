import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? '')
		.split(',')
		.map((host) => host.trim())
		.filter(Boolean);

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: allowedHosts.length > 0 ? { allowedHosts } : undefined,
		test: {
			environment: 'node',
			include: ['src/**/*.test.ts']
		}
	};
});
