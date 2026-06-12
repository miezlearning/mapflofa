<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import MemberForm from '$lib/components/admin/MemberForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const f = $derived((form ?? null) as FormState | null);
</script>

<svelte:head>
	<title>Tambah Pengurus · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Tambah Pengurus</h1>
		<p class="adm-sub">Isi data pengurus untuk ditampilkan pada struktur organisasi.</p>
	</div>
	<a class="adm-btn" href="/admin/members">← Kembali</a>
</div>

<div class="adm-card">
	<MemberForm
		values={f?.values ?? null}
		fieldErrors={f?.fieldErrors ?? null}
		message={f?.message ?? null}
		submitLabel="Simpan Pengurus"
		cancelHref="/admin/members"
		divisions={data.divisions}
		customGroups={data.customGroups}
	/>
</div>
