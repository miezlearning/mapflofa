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
	<div class="aurora" aria-hidden="true"></div>

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
			Halaman ini disembunyikan dari publik. Akses memerlukan akun admin yang dibuat lewat skrip
			seed.
		</p>
	</form>
</div>

<style>
	:global(html, body) {
		background: #05070d;
		margin: 0;
	}

	.login-shell {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem 1.25rem;
		color: #e5e7eb;
		background: #05070d;
		position: relative;
		overflow: hidden;
		font-family:
			'Inter',
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.aurora {
		position: absolute;
		inset: -10%;
		background:
			radial-gradient(600px 400px at 25% 20%, rgba(56, 189, 248, 0.18), transparent 60%),
			radial-gradient(600px 400px at 75% 80%, rgba(139, 92, 246, 0.15), transparent 60%);
		filter: blur(40px);
		z-index: 0;
	}

	.card {
		position: relative;
		width: min(420px, 100%);
		padding: 2rem;
		border-radius: 1.25rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.5));
		border: 1px solid rgba(148, 163, 184, 0.18);
		box-shadow: 0 30px 60px -30px rgba(2, 6, 23, 0.9);
		backdrop-filter: blur(8px);
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
		background: linear-gradient(135deg, #38bdf8, #6366f1);
		color: #fff;
		font-weight: 800;
		font-size: 0.75rem;
		box-shadow: 0 8px 24px -8px rgba(56, 189, 248, 0.7);
	}

	.brand-title {
		color: #f8fafc;
		font-weight: 800;
		font-size: 1rem;
	}

	.brand-sub {
		color: #94a3b8;
		font-size: 0.8125rem;
	}

	.alert {
		padding: 0.75rem 0.875rem;
		border-radius: 0.5rem;
		background: rgba(251, 113, 133, 0.1);
		border: 1px solid rgba(251, 113, 133, 0.3);
		color: #fda4af;
		font-size: 0.875rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.lbl {
		color: #cbd5e1;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.err {
		color: #fda4af;
		font-size: 0.75rem;
	}

	input {
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 150ms ease;
	}

	input:focus {
		border-color: rgba(56, 189, 248, 0.5);
	}

	button {
		margin-top: 0.5rem;
		padding: 0.6875rem 1rem;
		border-radius: 0.5rem;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		border: 1px solid rgba(56, 189, 248, 0.45);
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25));
		color: #e0f2fe;
		transition: all 150ms ease;
	}

	button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(99, 102, 241, 0.4));
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.hint {
		color: #64748b;
		font-size: 0.75rem;
		text-align: center;
		margin: 0.5rem 0 0;
	}
</style>
