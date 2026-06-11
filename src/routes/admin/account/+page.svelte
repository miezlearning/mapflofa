<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const profile = $derived(data.profile);

	type FormState = {
		profileMessage?: string;
		profileFieldErrors?: Record<string, string[] | undefined>;
		profileOk?: boolean;
		passwordMessage?: string;
		passwordFieldErrors?: Record<string, string[] | undefined>;
		passwordOk?: boolean;
		revoked?: number;
	};
	const f = $derived((form ?? null) as FormState | null);

	let savingProfile = $state(false);
	let savingPassword = $state(false);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Account</h1>
		<p class="adm-sub">Profil dan keamanan akun Anda.</p>
	</div>
</div>

<div class="grid">
	<!-- Profile card -->
	<div class="adm-card">
		<h2 class="card-title">Profil</h2>
		<dl class="meta">
			<div><dt>Email</dt><dd>{profile.email}</dd></div>
			<div><dt>Role</dt><dd><span class="role">{profile.role}</span></dd></div>
			<div>
				<dt>Login terakhir</dt>
				<dd>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}</dd>
			</div>
			<div>
				<dt>Akun dibuat</dt>
				<dd>{new Date(profile.createdAt).toLocaleString()}</dd>
			</div>
		</dl>

		{#if f?.profileOk}
			<div class="adm-flash adm-flash-ok">Profil berhasil diperbarui.</div>
		{:else if f?.profileMessage}
			<div class="adm-flash adm-flash-error">{f.profileMessage}</div>
		{/if}

		<form
			method="POST"
			action="?/updateProfile"
			class="adm-form"
			use:enhance={() => {
				savingProfile = true;
				return async ({ update }) => {
					await update();
					savingProfile = false;
				};
			}}
		>
			<label>
				<span class="field-label">Nama</span>
				<input type="text" name="name" value={profile.name} required maxlength="120" />
				{#if f?.profileFieldErrors?.name?.[0]}
					<span class="field-error">{f.profileFieldErrors.name[0]}</span>
				{/if}
			</label>
			<div class="form-actions">
				<button type="submit" class="adm-btn adm-btn-primary" disabled={savingProfile}>
					{savingProfile ? 'Saving…' : 'Save profile'}
				</button>
			</div>
		</form>
	</div>

	<!-- Password card -->
	<div class="adm-card">
		<h2 class="card-title">Ganti password</h2>
		<p class="card-sub">
			Setelah ganti password, semua sesi lain (perangkat lain) akan otomatis logout.
		</p>

		{#if f?.passwordOk}
			<div class="adm-flash adm-flash-ok">
				Password berhasil diubah.
				{#if f.revoked && f.revoked > 0}
					{f.revoked} sesi lain telah di-logout.
				{/if}
			</div>
		{:else if f?.passwordMessage}
			<div class="adm-flash adm-flash-error">{f.passwordMessage}</div>
		{/if}

		<form
			method="POST"
			action="?/changePassword"
			class="adm-form"
			use:enhance={() => {
				savingPassword = true;
				return async ({ update, formElement }) => {
					await update();
					savingPassword = false;
					if (f?.passwordOk) formElement.reset();
				};
			}}
		>
			<label>
				<span class="field-label">Password saat ini</span>
				<input type="password" name="currentPassword" autocomplete="current-password" required />
				{#if f?.passwordFieldErrors?.currentPassword?.[0]}
					<span class="field-error">{f.passwordFieldErrors.currentPassword[0]}</span>
				{/if}
			</label>
			<label>
				<span class="field-label">Password baru</span>
				<input
					type="password"
					name="newPassword"
					autocomplete="new-password"
					required
					minlength="12"
				/>
				<span class="field-hint">Minimal 12 karakter. Gunakan kombinasi huruf, angka, simbol.</span>
				{#if f?.passwordFieldErrors?.newPassword?.[0]}
					<span class="field-error">{f.passwordFieldErrors.newPassword[0]}</span>
				{/if}
			</label>
			<label>
				<span class="field-label">Konfirmasi password baru</span>
				<input
					type="password"
					name="confirmPassword"
					autocomplete="new-password"
					required
					minlength="12"
				/>
				{#if f?.passwordFieldErrors?.confirmPassword?.[0]}
					<span class="field-error">{f.passwordFieldErrors.confirmPassword[0]}</span>
				{/if}
			</label>
			<div class="form-actions">
				<button type="submit" class="adm-btn adm-btn-primary" disabled={savingPassword}>
					{savingPassword ? 'Saving…' : 'Change password'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 1rem;
	}

	.card-title {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.card-sub {
		color: #94a3b8;
		font-size: 0.8125rem;
		margin: 0 0 1rem;
	}

	.meta {
		margin: 0 0 1.25rem;
		display: grid;
		gap: 0.5rem;
	}

	.meta div {
		display: grid;
		grid-template-columns: 9rem 1fr;
		gap: 0.5rem;
		font-size: 0.8125rem;
	}

	.meta dt {
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.7rem;
		font-weight: 700;
	}

	.meta dd {
		margin: 0;
		color: #cbd5e1;
	}

	.role {
		display: inline-block;
		padding: 0.0625rem 0.5rem;
		border-radius: 0.25rem;
		background: rgba(192, 132, 252, 0.12);
		border: 1px solid rgba(192, 132, 252, 0.25);
		color: #c084fc;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
</style>
