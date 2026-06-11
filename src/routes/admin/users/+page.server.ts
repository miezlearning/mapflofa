import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { usersRepo } from '$lib/server/auth/users';
import { revokeAllSessions } from '$lib/server/auth/session';
import { audit } from '$lib/server/audit/log';

const ALLOWED_ROLES = ['admin', 'editor', 'viewer'] as const;

export const load: PageServerLoad = async (event) => {
	const me = requireRole(event, 'admin');
	const limit = Math.min(100, Math.max(1, Number(event.url.searchParams.get('limit') ?? '50')));
	const offset = Math.max(0, Number(event.url.searchParams.get('offset') ?? '0'));
	const q = event.url.searchParams.get('q')?.trim() || undefined;

	const { rows, total } = await usersRepo.list({ limit, offset, q });
	return {
		me: { id: me.id, email: me.email, role: me.role },
		items: rows.map((u) => ({
			id: u.id,
			email: u.email,
			name: u.name,
			role: u.role,
			isActive: u.isActive,
			createdAt: u.createdAt.toISOString(),
			lastLoginAt: u.lastLoginAt?.toISOString() ?? null
		})),
		pagination: { total, limit, offset },
		query: q ?? '',
		allowedRoles: ALLOWED_ROLES
	};
};

const inviteSchema = z.object({
	email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
	name: z.string().trim().min(1, 'Wajib diisi.').max(120, 'Terlalu panjang.'),
	password: z.string().min(12, 'Minimal 12 karakter.').max(200, 'Terlalu panjang.'),
	role: z.enum(ALLOWED_ROLES)
});

const roleSchema = z.object({
	id: z.coerce.number().int().positive(),
	role: z.enum(ALLOWED_ROLES)
});

const idSchema = z.object({ id: z.coerce.number().int().positive() });

export const actions: Actions = {
	invite: async (event) => {
		const me = requireRole(event, 'admin');
		const form = await event.request.formData();
		const parsed = inviteSchema.safeParse({
			email: form.get('email'),
			name: form.get('name'),
			password: form.get('password'),
			role: form.get('role') ?? 'viewer'
		});
		if (!parsed.success) {
			return fail(400, {
				invite: {
					values: Object.fromEntries(form),
					message: 'Periksa kembali isian.',
					fieldErrors: parsed.error.flatten().fieldErrors
				}
			});
		}

		const existing = await usersRepo.findByEmail(parsed.data.email);
		if (existing) {
			return fail(409, {
				invite: {
					values: Object.fromEntries(form),
					message: `Email ${parsed.data.email} sudah terdaftar.`
				}
			});
		}

		const created = await usersRepo.create(parsed.data);
		await audit(event, {
			action: 'user.create',
			resource: 'users',
			resourceId: created.id,
			details: { email: created.email, role: created.role, by: me.id }
		});
		throw redirect(303, '/admin/users');
	},

	updateRole: async (event) => {
		const me = requireRole(event, 'admin');
		const form = await event.request.formData();
		const parsed = roleSchema.safeParse({ id: form.get('id'), role: form.get('role') });
		if (!parsed.success) {
			return fail(400, { roleMessage: 'Input tidak valid.' });
		}

		if (parsed.data.id === me.id) {
			return fail(400, {
				roleMessage: 'Tidak bisa mengubah role akun Anda sendiri.'
			});
		}

		const target = await usersRepo.findById(parsed.data.id);
		if (!target) return fail(404, { roleMessage: 'User tidak ditemukan.' });

		// Block demoting the last active admin.
		if (
			target.role === 'admin' &&
			parsed.data.role !== 'admin' &&
			(await usersRepo.isLastActiveAdmin(target.id))
		) {
			return fail(400, {
				roleMessage: 'Tidak bisa menurunkan role admin terakhir.'
			});
		}

		await usersRepo.updateProfile(parsed.data.id, { role: parsed.data.role });
		await audit(event, {
			action: 'user.update',
			resource: 'users',
			resourceId: parsed.data.id,
			details: { role: parsed.data.role, by: me.id }
		});
		return { roleOk: parsed.data.id };
	},

	deactivate: async (event) => {
		const me = requireRole(event, 'admin');
		const form = await event.request.formData();
		const parsed = idSchema.safeParse({ id: form.get('id') });
		if (!parsed.success) return fail(400, { activeMessage: 'Input tidak valid.' });
		if (parsed.data.id === me.id) {
			return fail(400, { activeMessage: 'Tidak bisa menonaktifkan akun Anda sendiri.' });
		}

		const target = await usersRepo.findById(parsed.data.id);
		if (!target) return fail(404, { activeMessage: 'User tidak ditemukan.' });

		if (target.role === 'admin' && (await usersRepo.isLastActiveAdmin(target.id))) {
			return fail(400, {
				activeMessage: 'Tidak bisa menonaktifkan admin terakhir.'
			});
		}

		await usersRepo.setActive(parsed.data.id, false);
		const revoked = await revokeAllSessions(parsed.data.id);
		await audit(event, {
			action: 'user.deactivate',
			resource: 'users',
			resourceId: parsed.data.id,
			details: { by: me.id, revokedSessions: revoked }
		});
		return { activeOk: parsed.data.id };
	},

	activate: async (event) => {
		const me = requireRole(event, 'admin');
		const form = await event.request.formData();
		const parsed = idSchema.safeParse({ id: form.get('id') });
		if (!parsed.success) return fail(400, { activeMessage: 'Input tidak valid.' });

		await usersRepo.setActive(parsed.data.id, true);
		await audit(event, {
			action: 'user.activate',
			resource: 'users',
			resourceId: parsed.data.id,
			details: { by: me.id }
		});
		return { activeOk: parsed.data.id };
	}
};
