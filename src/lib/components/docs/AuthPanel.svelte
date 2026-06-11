<script lang="ts">
	import { onMount } from 'svelte';
	import { authToken } from './auth-store.svelte';
	import { locale } from '$lib/i18n/locale.svelte';

	let open = $state(false);
	let draft = $state('');

	onMount(() => {
		authToken.hydrate();
		draft = authToken.value;
	});

	function save() {
		authToken.set(draft.trim());
		open = false;
	}

	function logout() {
		authToken.clear();
		draft = '';
	}
</script>

<div class="auth-bar">
	<div class="auth-status">
		{#if authToken.isSet}
			<span class="auth-dot dot-on" aria-hidden="true"></span>
			<span class="auth-label">{locale.t('auth.authorized')}</span>
			<span class="auth-hint">{locale.t('auth.authorizedHint')}</span>
		{:else}
			<span class="auth-dot dot-off" aria-hidden="true"></span>
			<span class="auth-label">{locale.t('auth.notAuthorized')}</span>
			<span class="auth-hint">{locale.t('auth.notAuthorizedHint')}</span>
		{/if}
	</div>

	<div class="auth-actions">
		{#if authToken.isSet}
			<button type="button" class="auth-btn ghost" onclick={logout}>
				{locale.t('auth.logout')}
			</button>
		{/if}
		<button type="button" class="auth-btn primary" onclick={() => (open = !open)}>
			🔐 {authToken.isSet ? locale.t('auth.update') : locale.t('auth.authorize')}
		</button>
	</div>
</div>

{#if open}
	<div class="auth-form">
		<label for="auth-input">
			<strong>{locale.t('auth.tokenLabel')}</strong>
			<span>{locale.t('auth.tokenHint')}</span>
		</label>
		<div class="auth-input-row">
			<input
				id="auth-input"
				type="password"
				autocomplete="off"
				spellcheck="false"
				bind:value={draft}
				placeholder={locale.t('auth.tokenPlaceholder')}
			/>
			<button type="button" class="auth-btn primary" onclick={save}>
				{locale.t('auth.save')}
			</button>
		</div>
	</div>
{/if}

<style>
	.auth-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-radius: 0.875rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.15);
		margin-bottom: 1.5rem;
	}

	.auth-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.auth-dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		flex: none;
	}

	.dot-on {
		background: #34d399;
		box-shadow: 0 0 12px rgba(52, 211, 153, 0.55);
	}

	.dot-off {
		background: #475569;
	}

	.auth-label {
		font-weight: 700;
		color: #f1f5f9;
		font-size: 0.875rem;
	}

	.auth-hint {
		color: #64748b;
		font-size: 0.8125rem;
	}

	.auth-actions {
		display: flex;
		gap: 0.5rem;
	}

	.auth-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
		font-weight: 600;
		border-radius: 0.5rem;
		border: 1px solid rgba(148, 163, 184, 0.2);
		background: rgba(15, 23, 42, 0.6);
		color: #f1f5f9;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.auth-btn:hover {
		transform: translateY(-1px);
	}

	.auth-btn.primary {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(99, 102, 241, 0.18));
		border-color: rgba(56, 189, 248, 0.4);
		color: #e0f2fe;
	}

	.auth-btn.primary:hover {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.28), rgba(99, 102, 241, 0.28));
	}

	.auth-btn.ghost:hover {
		border-color: rgba(251, 113, 133, 0.4);
		color: #fb7185;
	}

	.auth-form {
		padding: 1.25rem;
		border-radius: 0.875rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(56, 189, 248, 0.25);
		margin-bottom: 1.5rem;
	}

	.auth-form label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.auth-form label strong {
		display: block;
		color: #f1f5f9;
		font-size: 0.875rem;
		font-weight: 700;
	}

	.auth-form label span {
		display: block;
		color: #64748b;
		font-size: 0.8125rem;
		margin-top: 0.125rem;
	}

	.auth-input-row {
		display: flex;
		gap: 0.5rem;
	}

	.auth-input-row input {
		flex: 1;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875rem;
		outline: none;
	}

	.auth-input-row input:focus {
		border-color: rgba(56, 189, 248, 0.5);
	}
</style>
