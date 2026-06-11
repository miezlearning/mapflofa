import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { usersRepo } from '$lib/server/auth/users';
import { verifyPassword } from '$lib/server/auth/password';
import { revokeAllSessions } from '$lib/server/auth/session';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	const user = requireUser(event);
	return {
		profile: {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
			createdAt: user.createdAt.toISOString()
		}
	};
};

const profileSchema = z.object({
	name: z.string().trim().min(1, 'Nama tidak boleh kosong.').max(120, 'Nama terlalu panjang.')
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Wajib diisi.'),
		newPassword: z
			.string()
			.min(12, 'Minimal 12 karakter.')
			.max(200, 'Terlalu panjang.'),
		confirmPassword: z.string().min(1, 'Wajib diisi.')
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: 'Konfirmasi tidak cocok dengan password baru.',
		path: ['confirmPassword']
	});

export const actions: Actions = {
	updateProfile: async (event) => {
		const user = requireUser(event);
		const form = await event.request.formData();
		const parsed = profileSchema.safeParse({ name: form.get('name') });
		if (!parsed.success) {
			return fail(400, {
				profileMessage: 'Periksa kembali isian.',
				profileFieldErrors: parsed.error.flatten().fieldErrors
			});
		}
		await usersRepo.updateProfile(user.id, { name: parsed.data.name });
		await audit(event, {
			action: 'user.update',
			resource: 'users',
			resourceId: user.id,
			details: { self: true, fields: ['name'] }
		});
		return { profileOk: true };
	},

	changePassword: async (event) => {
		const user = requireUser(event);
		const form = await event.request.formData();
		const parsed = passwordSchema.safeParse({
			currentPassword: form.get('currentPassword'),
			newPassword: form.get('newPassword'),
			confirmPassword: form.get('confirmPassword')
		});
		if (!parsed.success) {
			return fail(400, {
				passwordMessage: 'Periksa kembali isian.',
				passwordFieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		const currentOk = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
		if (!currentOk) {
			return fail(401, {
				passwordMessage: 'Password saat ini salah.'
			});
		}

		await usersRepo.changePassword(user.id, parsed.data.newPassword);

		// Sign out every other session for this user — keep the current one.
		const revoked = event.locals.sessionId
			? await revokeAllSessions(user.id, event.locals.sessionId)
			: 0;

		await audit(event, {
			action: 'password.change',
			resource: 'users',
			resourceId: user.id,
			details: { revokedSessions: revoked }
		});

		return {
			passwordOk: true,
			revoked
		};
	}
};
