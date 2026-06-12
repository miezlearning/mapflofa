<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);

	type FormState = {
		email?: string;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const f = $derived((form ?? null) as FormState | null);
</script>

<svelte:head>
	<title>Sign in · Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="login-shell">
	<div class="bg-decor" aria-hidden="true"></div>

	<form
		method="POST"
		class="card"
		use:enhance={() => {
			submitting = true;
			return ({ update }) =>
				update().then(() => {
					submitting = false;
				});
		}}
	>
		<div class="header">
			<span class="brand-mark">MF</span>
			<div>
				<div class="brand-title">MAPFLOFA</div>
				<div class="brand-sub">Admin Dashboard</div>
			</div>
		</div>

		{#if f?.message}
			<div class="alert">{f.message}</div>
		{/if}

		<label>
			<span class="lbl">Email</span>
			<input
				type="email"
				name="email"
				autocomplete="email"
				required
				value={f?.email ?? ''}
				placeholder="admin@example.com"
			/>
			{#if f?.fieldErrors?.email}
				<span class="err">{f.fieldErrors.email[0]}</span>
			{/if}
		</label>

		<label>
			<span class="lbl">Password</span>
			<input type="password" name="password" autocomplete="current-password" required />
			{#if f?.fieldErrors?.password}
				<span class="err">{f.fieldErrors.password[0]}</span>
			{/if}
		</label>

		<button type="submit" disabled={submitting}>
			{submitting ? 'Signing in…' : 'Sign in'}
		</button>

		<p class="hint">
			Halaman ini disembunyikan dari publik. Akses memerlukan akun admin yang dibuat lewat skrip seed.
		</p>
	</form>
</div>

<style>
	.login-shell {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem 1.25rem;
		color: var(--color-ink, #333);
		background: var(--color-surface-3, #f0f8ff);
		position: relative;
		overflow: hidden;
		font-family: var(--font-sans, 'Plus Jakarta Sans', system-ui, sans-serif);
	}

	.bg-decor {
		position: absolute;
		top: -20%;
		right: -10%;
		width: 600px;
		height: 600px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(110, 174, 232, 0.15), transparent 70%);
		z-index: 0;
	}

	.card {
		position: relative;
		width: min(400px, 100%);
		padding: 2rem;
		border-radius: 1rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 1;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.625rem;
		background: var(--color-primary, #6eaee8);
		color: #fff;
		font-weight: 800;
		font-size: 0.8rem;
	}

	.brand-title {
		color: var(--color-ink, #333);
		font-weight: 800;
		font-size: 1.125rem;
	}

	.brand-sub {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
	}

	.alert {
		padding: 0.75rem 0.875rem;
		border-radius: 0.5rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		font-size: 0.875rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.lbl {
		color: var(--color-ink, #333);
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.err {
		color: #dc2626;
		font-size: 0.75rem;
	}

	input {
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	input:focus {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 3px rgba(110, 174, 232, 0.12);
	}

	button {
		margin-top: 0.5rem;
		padding: 0.6875rem 1rem;
		border-radius: 0.5rem;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		border: none;
		background: var(--color-primary, #6eaee8);
		color: #fff;
		transition: background 150ms ease;
	}

	button:hover:not(:disabled) {
		background: var(--color-primary-600, #4f97d6);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.hint {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
		text-align: center;
		margin: 0.5rem 0 0;
	}
</style>
