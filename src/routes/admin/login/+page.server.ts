import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { usersRepo } from '$lib/server/auth/users';
import { createSession, setSessionCookie } from '$lib/server/auth/session';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const next = sanitizeNext(url.searchParams.get('next'));
		throw redirect(303, next);
	}
	return {};
};

/** Only allow internal redirects so attackers can't bounce users off-site. */
function sanitizeNext(next: string | null): string {
	if (!next) return '/admin';
	if (!next.startsWith('/')) return '/admin';
	if (next.startsWith('//')) return '/admin';
	if (next.startsWith('/admin/login')) return '/admin';
	return next;
}

const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
	password: z.string().min(1, 'Password tidak boleh kosong.')
});

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const parsed = loginSchema.safeParse({
			email: form.get('email'),
			password: form.get('password')
		});

		if (!parsed.success) {
			return fail(400, {
				email: String(form.get('email') ?? ''),
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		const user = await usersRepo.authenticate(parsed.data.email, parsed.data.password);
		if (!user) {
			await audit(event, {
				action: 'login.failure',
				resource: 'auth',
				details: { email: parsed.data.email },
				actor: { email: parsed.data.email, role: 'anonymous' }
			});
			return fail(401, {
				email: parsed.data.email,
				message: 'Email atau password salah, atau akun tidak aktif.'
			});
		}

		const ip = (() => {
			try {
				return event.getClientAddress();
			} catch {
				return undefined;
			}
		})();
		const ua = event.request.headers.get('user-agent') ?? undefined;

		const token = await createSession(user.id, { ip, userAgent: ua });
		setSessionCookie(event.cookies, token);
		await usersRepo.touchLogin(user.id);

		await audit(event, {
			action: 'login.success',
			resource: 'auth',
			actor: { id: user.id, email: user.email, role: user.role }
		});

		throw redirect(303, sanitizeNext(event.url.searchParams.get('next')));
	}
};
