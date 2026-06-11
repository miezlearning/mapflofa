<script lang="ts">
	import type { AdminField } from '$lib/server/admin/resources';
	import { enhance } from '$app/forms';

	type Props = {
		fields: AdminField[];
		values?: Record<string, unknown> | null;
		fieldErrors?: Record<string, string[] | undefined> | null;
		message?: string | null;
		submitLabel?: string;
		cancelHref: string;
	};

	let {
		fields,
		values = null,
		fieldErrors = null,
		message = null,
		submitLabel = 'Save',
		cancelHref
	}: Props = $props();

	let submitting = $state(false);

	function value(name: string): string {
		const v = values?.[name];
		if (v === null || v === undefined) return '';
		return String(v);
	}
</script>

{#if message}
	<div class="adm-flash adm-flash-error">{message}</div>
{/if}

<form
	method="POST"
	class="adm-form"
	use:enhance={() => {
		submitting = true;
		return ({ update }) =>
			update().then(() => {
				submitting = false;
			});
	}}
>
	{#each fields as f (f.name)}
		<label>
			<span class="field-label">
				{f.label}
				{#if f.required}<span style="color:#fb7185">*</span>{/if}
			</span>

			{#if f.kind === 'textarea'}
				<textarea name={f.name} rows="3" required={f.required ?? false}>{value(f.name)}</textarea>
			{:else if f.kind === 'longtext'}
				<textarea name={f.name} rows="8">{value(f.name)}</textarea>
			{:else if f.kind === 'url'}
				<input
					type="url"
					name={f.name}
					inputmode="url"
					value={value(f.name)}
					required={f.required ?? false}
				/>
			{:else}
				<input type="text" name={f.name} value={value(f.name)} required={f.required ?? false} />
			{/if}

			{#if f.hint}
				<span class="field-hint">{f.hint}</span>
			{/if}
			{#if fieldErrors?.[f.name]?.[0]}
				<span class="field-error">{fieldErrors[f.name]![0]}</span>
			{/if}
		</label>
	{/each}

	<div class="form-actions">
		<button type="submit" class="adm-btn adm-btn-primary" disabled={submitting}>
			{submitting ? 'Saving…' : submitLabel}
		</button>
		<a href={cancelHref} class="adm-btn">Cancel</a>
	</div>
</form>
