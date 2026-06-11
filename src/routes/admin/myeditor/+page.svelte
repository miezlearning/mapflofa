<script lang="ts">
	type Program = {
		id: number;
		title: string;
		tag: string;
		excerpt: string;
		image: string;
		post: string | null;
		createdAt: string;
		updatedAt: string;
	};

	type ApiSuccess<T> = { ok: true; data: T };
	type ApiFailure = { ok: false; error?: { message?: string } };

	type ProgramListEnvelope = {
		items: Program[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
		};
	};

	type Draft = {
		id: number | null;
		title: string;
		tag: string;
		excerpt: string;
		image: string;
		post: string;
	};

	const emptyDraft: Draft = {
		id: null,
		title: '',
		tag: '',
		excerpt: '',
		image: '',
		post: ''
	};

	let items = $state<Program[]>([]);
	let draft = $state<Draft>({ ...emptyDraft });
	let selectedId = $state<number | null>(null);
	let loading = $state(false);
	let saving = $state(false);
	let deleting = $state(false);
	let search = $state('');
	let flash = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let editorRef = $state<HTMLTextAreaElement | null>(null);

	const selectedProgram = $derived(items.find((item) => item.id === selectedId) ?? null);
	const isCreateMode = $derived(draft.id === null);

	$effect(() => {
		void loadPrograms();
	});

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	function pickProgram(program: Program) {
		selectedId = program.id;
		draft = {
			id: program.id,
			title: program.title,
			tag: program.tag,
			excerpt: program.excerpt,
			image: program.image,
			post: program.post ?? ''
		};
		flash = null;
	}

	function newDocument() {
		selectedId = null;
		draft = { ...emptyDraft };
		flash = null;
	}

	async function loadPrograms() {
		loading = true;
		flash = null;
		try {
			const query = new URLSearchParams({ limit: '100', offset: '0' });
			if (search.trim().length > 0) query.set('q', search.trim());

			const response = await fetch(`/api/programs?${query.toString()}`);
			const json = (await response.json().catch(() => null)) as
				| ApiSuccess<ProgramListEnvelope>
				| ApiFailure
				| null;

			if (!response.ok || !json?.ok) {
				flash = {
					type: 'error',
					message: json && !json.ok ? (json.error?.message ?? 'Failed to load programs.') : 'Failed to load programs.'
				};
				return;
			}

			items = json.data.items;

			if (selectedId !== null) {
				const matched = json.data.items.find((item) => item.id === selectedId);
				if (matched) {
					pickProgram(matched);
				} else {
					newDocument();
				}
			}
		} catch {
			flash = { type: 'error', message: 'Network error while loading programs.' };
		} finally {
			loading = false;
		}
	}

	function insertMarkup(before: string, after = '') {
		if (!editorRef) return;
		const start = editorRef.selectionStart;
		const end = editorRef.selectionEnd;
		const selectedText = draft.post.slice(start, end);
		const wrapped = `${before}${selectedText}${after}`;

		draft = {
			...draft,
			post: `${draft.post.slice(0, start)}${wrapped}${draft.post.slice(end)}`
		};

		queueMicrotask(() => {
			if (!editorRef) return;
			editorRef.focus();
			editorRef.setSelectionRange(start + before.length, start + before.length + selectedText.length);
		});
	}

	function addBulletList() {
		insertMarkup('\n- ');
	}

	function addHeading() {
		insertMarkup('\n## ');
	}

	async function saveProgram() {
		if (saving) return;

		const payload = {
			title: draft.title.trim(),
			tag: draft.tag.trim(),
			excerpt: draft.excerpt.trim(),
			image: draft.image.trim(),
			post: draft.post.trim() === '' ? null : draft.post
		};

		if (!payload.title || !payload.tag || !payload.excerpt || !payload.image) {
			flash = {
				type: 'error',
				message: 'Title, tag, excerpt, and image URL are required.'
			};
			return;
		}

		saving = true;
		flash = null;

		const method = draft.id === null ? 'POST' : 'PATCH';
		const endpoint = draft.id === null ? '/api/programs' : `/api/programs/${draft.id}`;

		try {
			const response = await fetch(endpoint, {
				method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const json = (await response.json().catch(() => null)) as ApiSuccess<Program> | ApiFailure | null;

			if (!response.ok || !json?.ok) {
				flash = {
					type: 'error',
					message: json && !json.ok ? (json.error?.message ?? 'Failed to save document.') : 'Failed to save document.'
				};
				return;
			}

			const row = json.data;
			const exists = items.some((item) => item.id === row.id);
			items = exists ? items.map((item) => (item.id === row.id ? row : item)) : [row, ...items];
			pickProgram(row);
			flash = {
				type: 'success',
				message: method === 'POST' ? 'Document created.' : 'Document updated.'
			};
		} catch {
			flash = { type: 'error', message: 'Network error while saving document.' };
		} finally {
			saving = false;
		}
	}

	async function deleteProgram() {
		if (draft.id === null || deleting) return;
		if (!confirm('Delete this document permanently?')) return;

		deleting = true;
		flash = null;
		try {
			const response = await fetch(`/api/programs/${draft.id}`, {
				method: 'DELETE'
			});
			const json = (await response.json().catch(() => null)) as
				| ApiSuccess<{ id: number }>
				| ApiFailure
				| null;

			if (!response.ok || !json?.ok) {
				flash = {
					type: 'error',
					message: json && !json.ok ? (json.error?.message ?? 'Failed to delete document.') : 'Failed to delete document.'
				};
				return;
			}

			items = items.filter((item) => item.id !== draft.id);
			newDocument();
			flash = { type: 'success', message: 'Document deleted.' };
		} catch {
			flash = { type: 'error', message: 'Network error while deleting document.' };
		} finally {
			deleting = false;
		}
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			void loadPrograms();
		}
	}
</script>

<svelte:head>
	<title>My Editor | Admin</title>
</svelte:head>

<div class="editor-page">
	<aside class="documents-panel">
		<div class="panel-head">
			<h1>My Editor</h1>
			<button type="button" class="btn btn-primary" onclick={newDocument}>New Post</button>
		</div>

		<div class="search-row">
			<input
				type="search"
				placeholder="Search title or excerpt"
				bind:value={search}
				onkeydown={handleSearchKeydown}
			/>
			<button type="button" class="btn" onclick={() => void loadPrograms()} disabled={loading}>
				{loading ? 'Loading...' : 'Search'}
			</button>
		</div>

		<div class="documents-list">
			{#if items.length === 0}
				<p class="empty">No documents yet.</p>
			{:else}
				{#each items as item (item.id)}
					<button
						type="button"
						class="doc-item {selectedId === item.id ? 'active' : ''}"
						onclick={() => pickProgram(item)}
					>
						<strong>{item.title}</strong>
						<span>{item.tag}</span>
						<small>Updated {formatDate(item.updatedAt)}</small>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<section class="writing-panel">
		<div class="document-meta">
			<div>
				<h2>{isCreateMode ? 'Untitled draft' : draft.title || 'Untitled draft'}</h2>
				{#if selectedProgram}
					<p>Created {formatDate(selectedProgram.createdAt)} • Updated {formatDate(selectedProgram.updatedAt)}</p>
				{:else}
					<p>Start writing and publish to create a new post.</p>
				{/if}
			</div>
			<div class="actions">
				<button type="button" class="btn btn-primary" onclick={() => void saveProgram()} disabled={saving}>
					{saving ? 'Saving...' : isCreateMode ? 'Publish' : 'Update'}
				</button>
				<button
					type="button"
					class="btn btn-danger"
					onclick={() => void deleteProgram()}
					disabled={deleting || isCreateMode}
				>
					{deleting ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		</div>

		{#if flash}
			<p class="flash {flash.type === 'error' ? 'flash-error' : 'flash-success'}">{flash.message}</p>
		{/if}

		<div class="fields-grid">
			<label>
				<span>Title</span>
				<input type="text" bind:value={draft.title} placeholder="Write an engaging title..." />
			</label>
			<label>
				<span>Tag</span>
				<input type="text" bind:value={draft.tag} placeholder="Academic, Sports, Arts..." />
			</label>
			<label>
				<span>Image URL</span>
				<input type="url" bind:value={draft.image} placeholder="https://..." />
			</label>
			<label>
				<span>Excerpt</span>
				<textarea rows="3" bind:value={draft.excerpt} placeholder="Short summary shown in cards"></textarea>
			</label>
		</div>

		<div class="toolbar" role="toolbar" aria-label="Formatting tools">
			<button type="button" class="tool" onclick={addHeading}>Heading</button>
			<button type="button" class="tool" onclick={() => insertMarkup('**', '**')}>Bold</button>
			<button type="button" class="tool" onclick={() => insertMarkup('*', '*')}>Italic</button>
			<button type="button" class="tool" onclick={addBulletList}>Bullet List</button>
			<button type="button" class="tool" onclick={() => insertMarkup('[', '](https://)')}>Link</button>
		</div>

		<textarea
			class="doc-editor"
			bind:this={editorRef}
			bind:value={draft.post}
			placeholder="Start writing your program content..."
		></textarea>

		<div class="word-count">{draft.post.trim() ? draft.post.trim().split(/\s+/).length : 0} words</div>
	</section>
</div>

<style>
	:global(body) {
		background: linear-gradient(120deg, #eef4ff 0%, #fbfcff 40%, #f3faf7 100%);
	}

	.editor-page {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 1rem;
		padding: 1.25rem;
		min-height: calc(100dvh - 1rem);
	}

	.documents-panel,
	.writing-panel {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #dbe5f2;
		border-radius: 18px;
		box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
	}

	.documents-panel {
		display: grid;
		grid-template-rows: auto auto 1fr;
		overflow: hidden;
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	h1 {
		margin: 0;
		font-size: 1.1rem;
	}

	.search-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
		padding: 0.8rem 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.search-row input {
		border: 1px solid #cbd5e1;
		border-radius: 10px;
		padding: 0.55rem 0.65rem;
		font: inherit;
	}

	.documents-list {
		overflow: auto;
		padding: 0.6rem;
		display: grid;
		gap: 0.5rem;
	}

	.doc-item {
		text-align: left;
		padding: 0.75rem;
		border-radius: 12px;
		border: 1px solid #dbe5f2;
		background: #fff;
		display: grid;
		gap: 0.25rem;
		cursor: pointer;
	}

	.doc-item strong {
		font-size: 0.95rem;
	}

	.doc-item span,
	.doc-item small {
		color: #64748b;
	}

	.doc-item.active {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.empty {
		color: #64748b;
		text-align: center;
		margin-top: 2rem;
	}

	.writing-panel {
		padding: 1.25rem;
		display: grid;
		grid-template-rows: auto auto auto auto 1fr auto;
		gap: 0.9rem;
	}

	.document-meta {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
	}

	h2 {
		margin: 0;
		font-size: 1.3rem;
	}

	.document-meta p {
		margin: 0.2rem 0 0;
		color: #64748b;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.fields-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}

	.fields-grid label {
		display: grid;
		gap: 0.35rem;
	}

	.fields-grid label span {
		font-weight: 700;
		font-size: 0.84rem;
		color: #334155;
	}

	.fields-grid input,
	.fields-grid textarea {
		border: 1px solid #cbd5e1;
		border-radius: 10px;
		padding: 0.6rem 0.7rem;
		font: inherit;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.6rem;
		border: 1px solid #dbe5f2;
		border-radius: 12px;
		background: #f8fafc;
	}

	.tool {
		border: 1px solid #cbd5e1;
		background: #fff;
		border-radius: 8px;
		padding: 0.4rem 0.65rem;
		font-weight: 600;
		cursor: pointer;
	}

	.doc-editor {
		width: 100%;
		min-height: 340px;
		resize: vertical;
		border: 1px solid #cbd5e1;
		border-radius: 14px;
		padding: 1rem;
		font-family: 'Times New Roman', serif;
		font-size: 1.05rem;
		line-height: 1.75;
		background: #fff;
	}

	.word-count {
		text-align: right;
		color: #64748b;
		font-size: 0.85rem;
	}

	.btn {
		border: 1px solid #cbd5e1;
		background: #fff;
		color: #0f172a;
		border-radius: 10px;
		padding: 0.5rem 0.85rem;
		font-weight: 700;
		cursor: pointer;
	}

	.btn-primary {
		background: #0f172a;
		color: #fff;
		border-color: #0f172a;
	}

	.btn-danger {
		background: #dc2626;
		border-color: #dc2626;
		color: #fff;
	}

	.btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.flash {
		margin: 0;
		padding: 0.65rem 0.75rem;
		border-radius: 10px;
		font-weight: 700;
	}

	.flash-error {
		background: #fee2e2;
		color: #991b1b;
	}

	.flash-success {
		background: #dcfce7;
		color: #166534;
	}

	@media (max-width: 1024px) {
		.editor-page {
			grid-template-columns: 1fr;
		}

		.fields-grid {
			grid-template-columns: 1fr;
		}

		.document-meta {
			flex-direction: column;
		}
	}
</style>
