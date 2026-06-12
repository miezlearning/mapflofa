<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const items = $derived(data.items);

	type FormState = {
		invite?: {
			values?: Record<string, FormDataEntryValue>;
			message?: string;
			fieldErrors?: Record<string, string[] | undefined>;
		};
		roleMessage?: string;
		roleOk?: number;
		activeMessage?: string;
		activeOk?: number;
	};
	const f = $derived((form ?? null) as FormState | null);

	let inviteOpen = $state(false);
	let confirmId = $state<number | null>(null);
	let saving = $state(false);

	function fmt(date: string | null) {
		if (!date) return '—';
		return new Date(date).toLocaleString();
	}
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Users</h1>
		<p class="adm-sub">{data.pagination.total} akun terdaftar.</p>
	</div>
	<button
		type="button"
		class="adm-btn adm-btn-primary"
		onclick={() => (inviteOpen = !inviteOpen)}
	>
		{inviteOpen ? 'Cancel' : '+ Invite user'}
	</button>
</div>

{#if inviteOpen}
	<div class="adm-card" style="margin-bottom:1.25rem">
		<h2 style="margin:0 0 0.75rem;font-size:1rem;font-weight:700">Tambah user baru</h2>
		{#if f?.invite?.message}
			<div class="adm-flash adm-flash-error">{f.invite.message}</div>
		{/if}
		<form
			method="POST"
			action="?/invite"
			class="adm-form invite-grid"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
			<label>
				<span class="field-label">Nama</span>
				<input
					type="text"
					name="name"
					required
					maxlength="120"
					value={(f?.invite?.values?.name as string) ?? ''}
				/>
				{#if f?.invite?.fieldErrors?.name?.[0]}
					<span class="field-error">{f.invite.fieldErrors.name[0]}</span>
				{/if}
			</label>
			<label>
				<span class="field-label">Email</span>
				<input
					type="email"
					name="email"
					required
					autocomplete="off"
					value={(f?.invite?.values?.email as string) ?? ''}
				/>
				{#if f?.invite?.fieldErrors?.email?.[0]}
					<span class="field-error">{f.invite.fieldErrors.email[0]}</span>
				{/if}
			</label>
			<label>
				<span class="field-label">Role</span>
				<select name="role" required>
					{#each data.allowedRoles as role}
						<option value={role}>{role}</option>
					{/each}
				</select>
			</label>
			<label>
				<span class="field-label">Initial password</span>
				<input
					type="text"
					name="password"
					required
					autocomplete="off"
					minlength="12"
					placeholder="≥12 chars"
				/>
				<span class="field-hint">User wajib mengubahnya setelah login pertama.</span>
				{#if f?.invite?.fieldErrors?.password?.[0]}
					<span class="field-error">{f.invite.fieldErrors.password[0]}</span>
				{/if}
			</label>
			<div class="form-actions" style="grid-column:1/-1">
				<button type="submit" class="adm-btn adm-btn-primary" disabled={saving}>
					{saving ? 'Saving…' : 'Create user'}
				</button>
				<button type="button" class="adm-btn" onclick={() => (inviteOpen = false)}>Cancel</button>
			</div>
		</form>
	</div>
{/if}

{#if f?.roleMessage}
	<div class="adm-flash adm-flash-error">{f.roleMessage}</div>
{:else if f?.roleOk}
	<div class="adm-flash adm-flash-ok">Role berhasil diperbarui.</div>
{/if}

{#if f?.activeMessage}
	<div class="adm-flash adm-flash-error">{f.activeMessage}</div>
{:else if f?.activeOk}
	<div class="adm-flash adm-flash-ok">Status akun berhasil diperbarui.</div>
{/if}

<div class="adm-card" style="padding:0;overflow:hidden">
	<table class="adm-table">
		<thead>
			<tr>
				<th>User</th>
				<th>Role</th>
				<th>Status</th>
				<th>Last login</th>
				<th>Created</th>
				<th style="text-align:right">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each items as u (u.id)}
				{@const isSelf = u.id === data.me?.id}
				<tr>
					<td>
						<div class="user-cell">
							<div class="user-name">{u.name}</div>
							<div class="user-email">{u.email}</div>
						</div>
					</td>
					<td>
						{#if isSelf}
							<span class="role-pill">{u.role}</span>
							<span style="font-size:0.7rem;color:#64748b;display:block;margin-top:0.125rem">
								(akun Anda)
							</span>
						{:else}
							<form
								method="POST"
								action="?/updateRole"
								use:enhance={() => {
									return async ({ update }) => update();
								}}
							>
								<input type="hidden" name="id" value={u.id} />
								<select
									name="role"
									class="inline-select"
									onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
									value={u.role}
								>
									{#each data.allowedRoles as role}
										<option value={role}>{role}</option>
									{/each}
								</select>
							</form>
						{/if}
					</td>
					<td>
						{#if u.isActive}
							<span class="status active">● Active</span>
						{:else}
							<span class="status inactive">● Inactive</span>
						{/if}
					</td>
					<td><span class="dim">{fmt(u.lastLoginAt)}</span></td>
					<td><span class="dim">{fmt(u.createdAt)}</span></td>
					<td>
						<div class="actions">
							{#if isSelf}
								<a class="adm-btn" href="/admin/account">Account →</a>
							{:else if u.isActive}
								{#if confirmId === u.id}
									<form
										method="POST"
										action="?/deactivate"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												confirmId = null;
											};
										}}
									>
										<input type="hidden" name="id" value={u.id} />
										<button class="adm-btn adm-btn-danger" type="submit">Confirm deactivate</button>
									</form>
									<button type="button" class="adm-btn" onclick={() => (confirmId = null)}>
										Cancel
									</button>
								{:else}
									<button
										type="button"
										class="adm-btn adm-btn-danger"
										onclick={() => (confirmId = u.id)}
									>
										Deactivate
									</button>
								{/if}
							{:else}
								<form
									method="POST"
									action="?/activate"
									use:enhance={() => {
										return async ({ update }) => update();
									}}
								>
									<input type="hidden" name="id" value={u.id} />
									<button type="submit" class="adm-btn">Activate</button>
								</form>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.invite-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	@media (max-width: 700px) {
		.invite-grid {
			grid-template-columns: 1fr;
		}
	}

	.user-cell {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.user-name {
		color: var(--color-ink, #333);
		font-weight: 600;
		font-size: 0.875rem;
	}
	.user-email {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
	}
	.dim {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
	}

	.role-pill {
		display: inline-block;
		padding: 0.0625rem 0.5rem;
		border-radius: 0.25rem;
		background: var(--color-surface-2, #e8f4fd);
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-primary, #6eaee8);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.inline-select {
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.status {
		font-size: 0.75rem;
		font-weight: 700;
	}
	.status.active {
		color: #16a34a;
	}
	.status.inactive {
		color: #dc2626;
	}
</style>
