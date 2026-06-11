<script lang="ts">
	/**
	 * Inline contenteditable rich-text editor.
	 *
	 * Layout:
	 *   ┌──────────────── Action bar (sticky top) ────────────────┐
	 *   │ Cancel · /berita/[slug] · autosave · Preview · Save     │
	 *   ├──────┬─────────────────────────────────────────────────┤
	 *   │ Side │  Post canvas (looks like the public detail     │
	 *   │ Tool │  page; everything is editable in place)        │
	 *   └──────┴─────────────────────────────────────────────────┘
	 *
	 * Quirks handled:
	 *   - Toolbar lives outside contenteditable, so clicking a button blurs
	 *     the editor. We snapshot the selection on every change inside the
	 *     editor and restore it before running format commands.
	 *   - Empty editor has no block wrapper, so markdown shortcuts couldn't
	 *     find a "current block". We seed `<p><br></p>` and normalize on
	 *     every input.
	 *   - Pressing Enter inside a heading produced another heading. We
	 *     intercept Enter and force a fresh `<p>` instead.
	 */
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import {
		caretToEnd,
		caretToStart,
		currentBlock,
		isCaretAtEndOf,
		normalizeBlocks,
		remember,
		restore
	} from './editor/selection';
	import {
		captureSelection,
		EditorHistory,
		restoreSelection,
		type Snapshot
	} from './editor/history';
	import { flattenNested, setBlockTag, selectionMatchesTag, type BlockTag } from './editor/blocks';

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};

	type Props = {
		initial?: Record<string, unknown> | null;
		form?: FormState | null;
		submitLabel: string;
		cancelHref: string;
		previewSlug?: string | null;
	};

	let { initial = null, form = null, submitLabel, cancelHref, previewSlug = null }: Props =
		$props();

	function pick(name: string, fallback = ''): string {
		const v = form?.values?.[name] ?? initial?.[name];
		if (v === null || v === undefined) return fallback;
		return String(v);
	}

	// ---------- Editable state ----------
	let title = $state(pick('title'));
	let category = $state(pick('category', 'Berita'));
	let date = $state(pick('date'));
	let excerpt = $state(pick('excerpt'));
	let image = $state(pick('image'));

	const initialSlug = pick('slug');
	let slug = $state(initialSlug);
	let slugTouched = $state(initialSlug.length > 0);

	$effect(() => {
		if (!slugTouched && title) {
			slug = title
				.normalize('NFKD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '')
				.slice(0, 120);
		}
	});

	// Body — captured from contenteditable on input.
	const initialContent = pick('content');
	let bodyEl = $state<HTMLElement>();
	let contentHtml = $state(initialContent);

	let saving = $state(false);
	let savedToast = $state<string | null>(null);
	let savedToastTimer: ReturnType<typeof setTimeout> | null = null;
	let coverUploading = $state(false);
	let coverError = $state<string | null>(null);

	let activeStates = $state({
		bold: false,
		italic: false,
		underline: false,
		h1: false,
		h2: false,
		h3: false,
		quote: false,
		ul: false,
		ol: false
	});

	// ---------- Undo / redo ----------

	const editorHistory = new EditorHistory();
	let canUndo = $state(false);
	let canRedo = $state(false);

	let typingCommitTimer: ReturnType<typeof setTimeout> | null = null;
	let suppressNextSnapshot = $state(false);

	function snapshot(): Snapshot {
		return {
			html: bodyEl ? bodyEl.innerHTML : '',
			sel: bodyEl ? captureSelection(bodyEl) : null
		};
	}

	function refreshHistoryButtons() {
		canUndo = editorHistory.canUndo;
		canRedo = editorHistory.canRedo;
	}

	/** Take a snapshot BEFORE a structural change. */
	function commitBefore() {
		if (!bodyEl || suppressNextSnapshot) return;
		// Cancel any debounced typing-commit so we don't double-push.
		if (typingCommitTimer) {
			clearTimeout(typingCommitTimer);
			typingCommitTimer = null;
		}
		editorHistory.push(snapshot());
		refreshHistoryButtons();
	}

	/** Schedule a snapshot AFTER typing has settled (debounced). */
	function scheduleTypingCommit() {
		if (suppressNextSnapshot) return;
		if (typingCommitTimer) clearTimeout(typingCommitTimer);
		typingCommitTimer = setTimeout(() => {
			if (!bodyEl) return;
			editorHistory.push(snapshot());
			refreshHistoryButtons();
		}, 600);
	}

	function applySnapshot(snap: Snapshot | null) {
		if (!snap || !bodyEl) return;
		suppressNextSnapshot = true;
		bodyEl.innerHTML = snap.html;
		normalizeBlocks(bodyEl);
		restoreSelection(bodyEl, snap.sel);
		bodyEl.focus();
		contentHtml = bodyEl.innerHTML;
		refreshActiveStates();
		refreshHistoryButtons();
		// Re-enable snapshot capture next tick so the input event triggered
		// by the DOM swap doesn't re-push it.
		queueMicrotask(() => (suppressNextSnapshot = false));
	}

	function doUndo() {
		const snap = editorHistory.undo();
		if (snap) applySnapshot(snap);
	}

	function doRedo() {
		const snap = editorHistory.redo();
		if (snap) applySnapshot(snap);
	}

	function err(name: string): string | null {
		return form?.fieldErrors?.[name]?.[0] ?? null;
	}

	// ---------- Format command helpers ----------

	function refreshActiveStates() {
		try {
			activeStates = {
				bold: document.queryCommandState('bold'),
				italic: document.queryCommandState('italic'),
				underline: document.queryCommandState('underline'),
				h1: bodyEl ? selectionMatchesTag(bodyEl, 'h1') : false,
				h2: bodyEl ? selectionMatchesTag(bodyEl, 'h2') : false,
				h3: bodyEl ? selectionMatchesTag(bodyEl, 'h3') : false,
				quote: bodyEl ? selectionMatchesTag(bodyEl, 'blockquote') : false,
				ul: document.queryCommandState('insertUnorderedList'),
				ol: document.queryCommandState('insertOrderedList')
			};
		} catch {
			// queryCommandState can throw when the editor isn't focused.
		}
	}

	function queryBlock(tag: string): boolean {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return false;
		let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
		while (node && node !== bodyEl) {
			if (node.nodeType === 1 && (node as Element).tagName === tag) return true;
			node = node.parentNode;
		}
		return false;
	}

	function exec(cmd: string, value?: string) {
		if (!bodyEl) return;
		commitBefore();
		restore(bodyEl);
		document.execCommand(cmd, false, value);
		captureBody();
		refreshActiveStates();
		remember(bodyEl);
	}

	function applyBlock(tag: BlockTag) {
		if (!bodyEl) return;
		commitBefore();
		restore(bodyEl);
		// Custom block-toggle: replaces every selected block with the target
		// tag, or back to <p> if every block already has the tag. Avoids the
		// nested-heading bug from execCommand('formatBlock').
		setBlockTag(bodyEl, tag);
		captureBody();
		refreshActiveStates();
		remember(bodyEl);
	}

	function makeLink() {
		if (!bodyEl) return;
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed) {
			alert('Pilih teks dulu untuk dijadikan link.');
			return;
		}
		const url = window.prompt('URL link:', 'https://');
		if (!url) return;
		commitBefore();
		restore(bodyEl);
		document.execCommand('createLink', false, url);
		captureBody();
		remember(bodyEl);
	}

	function clearFormatting() {
		if (!bodyEl) return;
		commitBefore();
		restore(bodyEl);
		document.execCommand('removeFormat');
		// Force every selected block back to <p> via our custom replacer
		// (formatBlock + nested headings = same stacking issue).
		setBlockTag(bodyEl, 'p');
		flattenNested(bodyEl);
		captureBody();
		refreshActiveStates();
		remember(bodyEl);
	}

	// ---------- Body capture ----------

	function captureBody() {
		if (!bodyEl) return;
		// Don't collapse the editor if the user emptied it; keep an empty <p>
		// so the next keystroke has somewhere to go.
		if (
			bodyEl.children.length === 0 ||
			(bodyEl.children.length === 1 && bodyEl.firstElementChild?.tagName === 'BR')
		) {
			bodyEl.innerHTML = '<p><br></p>';
			caretToEnd(bodyEl);
		}
		// Safety net against any nested-heading leak (paste, drag, etc.)
		flattenNested(bodyEl);
		contentHtml = bodyEl.innerHTML;
		// Debounced snapshot for typing — only after structural commits stop firing.
		scheduleTypingCommit();
	}

	function onPaste(e: ClipboardEvent) {
		// Image paste → upload
		const items = e.clipboardData?.items ?? [];
		for (const item of items) {
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					e.preventDefault();
					handleInlineImage(file);
					return;
				}
			}
		}
		// Text paste — strip formatting we don't allow.
		const text = e.clipboardData?.getData('text/plain');
		if (text !== undefined) {
			e.preventDefault();
			commitBefore();
			document.execCommand('insertText', false, text);
		}
	}

	async function onDrop(e: DragEvent) {
		const file = e.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			e.preventDefault();
			await handleInlineImage(file);
		}
	}

	// ---------- Image upload ----------

	async function uploadImage(file: File): Promise<string | null> {
		const fd = new FormData();
		fd.append('file', file);
		const r = await fetch('/api/uploads', { method: 'POST', body: fd });
		const j = await r.json();
		if (!r.ok || !j.ok) return null;
		return new URL(j.data.url, location.origin).toString();
	}

	async function handleInlineImage(file: File) {
		if (!bodyEl) return;
		const url = await uploadImage(file);
		if (!url) {
			alert('Upload gagal.');
			return;
		}
		commitBefore();
		restore(bodyEl);
		const alt = file.name.replace(/\.[^.]+$/, '');
		const html = `<figure class="md-figure"><img src="${url}" alt="${escapeAttr(alt)}" loading="lazy" /><figcaption>${escapeAttr(alt)}</figcaption></figure><p><br></p>`;
		document.execCommand('insertHTML', false, html);
		captureBody();
	}

	function escapeAttr(s: string): string {
		return s
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function pickInlineImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/jpeg,image/png,image/webp,image/gif';
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) handleInlineImage(file);
		};
		input.click();
	}

	async function handleCoverUpload(file: File) {
		coverUploading = true;
		coverError = null;
		try {
			const url = await uploadImage(file);
			if (!url) {
				coverError = 'Upload gagal.';
				return;
			}
			image = url;
		} finally {
			coverUploading = false;
		}
	}

	function pickCover() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/jpeg,image/png,image/webp,image/gif';
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) handleCoverUpload(file);
		};
		input.click();
	}

	// ---------- Markdown shortcuts ----------

	type ShortcutAction =
		| { kind: 'block'; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote' }
		| { kind: 'list'; ordered: boolean };

	const SHORTCUTS: { match: RegExp; action: ShortcutAction }[] = [
		{ match: /^####$/, action: { kind: 'block', tag: 'h4' } },
		{ match: /^###$/, action: { kind: 'block', tag: 'h3' } },
		{ match: /^##$/, action: { kind: 'block', tag: 'h2' } },
		{ match: /^#$/, action: { kind: 'block', tag: 'h1' } },
		{ match: /^>$/, action: { kind: 'block', tag: 'blockquote' } },
		{ match: /^[-*]$/, action: { kind: 'list', ordered: false } },
		{ match: /^1\.$/, action: { kind: 'list', ordered: true } }
	];

	function getLineTextBeforeCursor(): { text: string; block: HTMLElement | null } {
		if (!bodyEl) return { text: '', block: null };
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return { text: '', block: null };
		const range = sel.getRangeAt(0);
		const block = currentBlock(bodyEl);
		if (!block) return { text: '', block: null };
		const pre = range.cloneRange();
		pre.selectNodeContents(block);
		pre.setEnd(range.endContainer, range.endOffset);
		return { text: pre.toString(), block };
	}

	/** Trigger before space is added: rewrite `## ` → H2 etc. */
	function tryMarkdownShortcut(): boolean {
		if (!bodyEl) return false;
		const { text, block } = getLineTextBeforeCursor();
		if (!block) return false;
		// Pattern must occupy the entire line so far.
		if (text !== (block.textContent ?? '')) return false;

		for (const sc of SHORTCUTS) {
			if (!sc.match.test(text)) continue;

			commitBefore();

			// Empty the prefix-only block and place the caret in it BEFORE
			// switching block type — keeps the caret inside the new element.
			block.textContent = '';
			caretToStart(block);

			if (sc.action.kind === 'block') {
				setBlockTag(bodyEl, sc.action.tag);
			} else {
				document.execCommand(
					sc.action.ordered ? 'insertOrderedList' : 'insertUnorderedList'
				);
			}
			captureBody();
			refreshActiveStates();
			remember(bodyEl);
			return true;
		}
		return false;
	}

	/** `---` + Enter → horizontal rule */
	function tryHrShortcut(): boolean {
		if (!bodyEl) return false;
		const { text, block } = getLineTextBeforeCursor();
		if (!block) return false;
		if (text !== (block.textContent ?? '')) return false;
		if (!/^---$/.test(text)) return false;
		commitBefore();
		block.textContent = '';
		caretToStart(block);
		document.execCommand('insertHTML', false, '<hr><p><br></p>');
		captureBody();
		return true;
	}

	/**
	 * Pressing Enter at the end of a heading or blockquote should drop to
	 * a regular paragraph for the new line, not continue the same block.
	 */
	function handleEnterAfterHeading(e: KeyboardEvent): boolean {
		if (e.shiftKey || !bodyEl) return false;
		const block = currentBlock(bodyEl);
		if (!block) return false;
		const tag = block.tagName;
		if (!/^(H1|H2|H3|H4|H5|H6|BLOCKQUOTE)$/.test(tag)) return false;
		if (!isCaretAtEndOf(block)) return false;

		e.preventDefault();
		commitBefore();
		// Insert a new <p> after the heading and place the caret in it.
		const p = document.createElement('p');
		p.innerHTML = '<br>';
		block.after(p);
		caretToStart(p);
		captureBody();
		refreshActiveStates();
		remember(bodyEl);
		return true;
	}

	function onKeyDown(e: KeyboardEvent) {
		// Custom undo/redo — replace browser native so structural changes
		// (markdown shortcuts, format commands) are reversible too.
		if ((e.ctrlKey || e.metaKey) && !e.altKey) {
			const k = e.key.toLowerCase();
			if (k === 'z' && !e.shiftKey) {
				e.preventDefault();
				doUndo();
				return;
			}
			if (k === 'y' || (k === 'z' && e.shiftKey)) {
				e.preventDefault();
				doRedo();
				return;
			}
		}

		if (e.key === ' ') {
			if (tryMarkdownShortcut()) e.preventDefault();
		} else if (e.key === 'Enter') {
			if (handleEnterAfterHeading(e)) return;
			if (tryHrShortcut()) e.preventDefault();
		}
	}

	// ---------- Autosave to localStorage ----------

	const draftKey = $derived(initial && initial.id ? `news-draft:${initial.id}` : 'news-draft:new');

	type DraftPayload = {
		title: string;
		slug: string;
		category: string;
		date: string;
		excerpt: string;
		image: string;
		content: string;
		savedAt: string;
		/** Source updatedAt of the record this draft was forked from. */
		baseUpdatedAt: string | null;
	};

	const baseUpdatedAt = $derived(
		typeof initial?.updatedAt === 'string'
			? initial.updatedAt
			: initial?.updatedAt
				? String(initial.updatedAt)
				: null
	);

	let autosaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let lastSavedAt = $state<Date | null>(null);
	let restoreBanner = $state<{ savedAt: Date; data: DraftPayload } | null>(null);
	let suppressAutosave = $state(true);

	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let savedFlashTimer: ReturnType<typeof setTimeout> | null = null;

	function persistDraft() {
		if (typeof localStorage === 'undefined') return;
		const data: DraftPayload = {
			title,
			slug,
			category,
			date,
			excerpt,
			image,
			content: contentHtml,
			savedAt: new Date().toISOString(),
			baseUpdatedAt
		};
		try {
			localStorage.setItem(draftKey, JSON.stringify(data));
			autosaveStatus = 'saved';
			lastSavedAt = new Date();
			if (savedFlashTimer) clearTimeout(savedFlashTimer);
			savedFlashTimer = setTimeout(() => {
				if (autosaveStatus === 'saved') autosaveStatus = 'idle';
			}, 2500);
		} catch (e) {
			console.error('[autosave]', e);
			autosaveStatus = 'error';
		}
	}

	function scheduleAutosave() {
		if (suppressAutosave) return;
		autosaveStatus = 'saving';
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(persistDraft, 800);
	}

	function clearDraft() {
		if (typeof localStorage === 'undefined') return;
		localStorage.removeItem(draftKey);
		autosaveStatus = 'idle';
		lastSavedAt = null;
	}

	function flashSaved(message: string) {
		savedToast = message;
		if (savedToastTimer) clearTimeout(savedToastTimer);
		savedToastTimer = setTimeout(() => (savedToast = null), 2800);
	}

	/**
	 * Compare a stored draft against the record we just loaded.
	 *
	 * Don't show the restore banner if:
	 *   - the draft is older than the record's last save (server is newer), or
	 *   - the draft fields are identical to what's on screen anyway.
	 */
	function loadDraft(): { savedAt: Date; data: DraftPayload } | null {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem(draftKey);
			if (!raw) return null;
			const data = JSON.parse(raw) as DraftPayload;
			const savedAt = new Date(data.savedAt);

			// Server has newer data — drop the stale draft.
			if (
				baseUpdatedAt &&
				data.baseUpdatedAt &&
				new Date(baseUpdatedAt) > new Date(data.baseUpdatedAt)
			) {
				localStorage.removeItem(draftKey);
				return null;
			}

			// Same content as current → nothing to restore.
			if (
				data.title === pick('title') &&
				data.content === pick('content') &&
				data.excerpt === pick('excerpt') &&
				data.image === pick('image') &&
				data.slug === pick('slug') &&
				data.category === pick('category', 'Berita') &&
				data.date === pick('date')
			) {
				return null;
			}

			return { savedAt, data };
		} catch {
			return null;
		}
	}

	function applyDraft() {
		if (!restoreBanner) return;
		const d = restoreBanner.data;
		suppressAutosave = true;
		title = d.title;
		slug = d.slug;
		slugTouched = true;
		category = d.category;
		date = d.date;
		excerpt = d.excerpt;
		image = d.image;
		contentHtml = d.content;
		if (bodyEl) {
			bodyEl.innerHTML = d.content || '<p><br></p>';
			normalizeBlocks(bodyEl);
			// Reset history baseline to the restored state — Ctrl+Z shouldn't
			// "undo" the restore itself.
			editorHistory.reset(snapshot());
			refreshHistoryButtons();
		}
		restoreBanner = null;
		queueMicrotask(() => (suppressAutosave = false));
	}

	function discardDraft() {
		clearDraft();
		restoreBanner = null;
	}

	// Reactive autosave trigger.
	$effect(() => {
		// Touch every editable field so Svelte tracks them.
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		title; slug; category; date; excerpt; image; contentHtml;
		scheduleAutosave();
	});

	// ---------- Lifecycle ----------

	onMount(() => {
		if (bodyEl) {
			if (!bodyEl.innerHTML.trim()) bodyEl.innerHTML = '<p><br></p>';
			normalizeBlocks(bodyEl);

			// Seed history with the initial state so Ctrl+Z reaches "blank slate".
			editorHistory.reset(snapshot());
			refreshHistoryButtons();
		}

		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (url.searchParams.get('created') === '1') {
				flashSaved('Berita baru dipublikasikan');
				url.searchParams.delete('created');
				history.replaceState(history.state, '', url.toString());
			}
		}

		const draft = loadDraft();
		if (draft) restoreBanner = draft;

		queueMicrotask(() => (suppressAutosave = false));

		const onSelectionChange = () => {
			refreshActiveStates();
			if (bodyEl) remember(bodyEl);
		};
		document.addEventListener('selectionchange', onSelectionChange);
		return () => {
			document.removeEventListener('selectionchange', onSelectionChange);
			if (autosaveTimer) clearTimeout(autosaveTimer);
			if (savedFlashTimer) clearTimeout(savedFlashTimer);
			if (savedToastTimer) clearTimeout(savedToastTimer);
			if (typingCommitTimer) clearTimeout(typingCommitTimer);
		};
	});

	// ---------- UI helpers ----------

	function formatRelativeTime(d: Date | null): string {
		if (!d) return '';
		const sec = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
		if (sec < 5) return 'baru saja';
		if (sec < 60) return `${sec} detik lalu`;
		const min = Math.round(sec / 60);
		if (min < 60) return `${min} menit lalu`;
		const hr = Math.round(min / 60);
		return `${hr} jam lalu`;
	}

	let nowTick = $state(0);
	$effect(() => {
		const id = setInterval(() => (nowTick = (nowTick + 1) & 0xfff), 30_000);
		return () => clearInterval(id);
	});
	const relativeText = $derived.by(() => {
		nowTick;
		return formatRelativeTime(lastSavedAt);
	});
</script>

<!-- Saved toast -->
{#if savedToast}
	<div class="saved-toast" role="status" aria-live="polite">
		<span class="check">✓</span>
		<span>{savedToast}</span>
	</div>
{/if}

<!-- Restore-draft banner -->
{#if restoreBanner}
	<div class="restore-banner">
		<div class="rb-text">
			Ada draft tersimpan dari <strong>{formatRelativeTime(restoreBanner.savedAt)}</strong>.
			Pulihkan?
		</div>
		<div class="rb-actions">
			<button type="button" class="adm-btn adm-btn-primary" onclick={applyDraft}>
				Pulihkan draft
			</button>
			<button type="button" class="adm-btn" onclick={discardDraft}>Buang</button>
		</div>
	</div>
{/if}

{#if form?.message}
	<div class="adm-flash adm-flash-error">{form.message}</div>
{/if}

<form
	method="POST"
	class="re-form"
	use:enhance={() => {
		captureBody();
		saving = true;
		return async ({ result, update }) => {
			await update({ reset: false });
			saving = false;
			if (result.type === 'success' || result.type === 'redirect') {
				clearDraft();
				flashSaved('Tersimpan');
			}
		};
	}}
>
	<input type="hidden" name="title" value={title} />
	<input type="hidden" name="slug" value={slug} />
	<input type="hidden" name="category" value={category} />
	<input type="hidden" name="date" value={date} />
	<input type="hidden" name="excerpt" value={excerpt} />
	<input type="hidden" name="image" value={image} />
	<input type="hidden" name="content" value={contentHtml} />

	<!-- Sticky action bar -->
	<div class="actionbar">
		<a href={cancelHref} class="adm-btn">← Batal</a>

		<div class="ab-meta">
			<span class="slug-prefix">/berita/</span>
			<input
				type="text"
				class="slug-input"
				placeholder="slug-url"
				bind:value={slug}
				oninput={() => (slugTouched = true)}
				maxlength="120"
			/>
			{#if err('slug')}<span class="adm-flash adm-flash-error inline">{err('slug')}</span>{/if}
		</div>

		<div class="autosave" data-status={autosaveStatus}>
			{#if autosaveStatus === 'saving'}
				<span class="dot saving"></span><span>Menyimpan…</span>
			{:else if autosaveStatus === 'saved'}
				<span class="dot saved"></span><span>Draft disimpan</span>
			{:else if autosaveStatus === 'error'}
				<span class="dot error"></span><span>Gagal autosave</span>
			{:else if lastSavedAt}
				<span class="dot idle"></span><span>Draft · {relativeText}</span>
			{/if}
		</div>

		<div class="ab-actions">
			{#if previewSlug}
				<a class="adm-btn" href={`/berita/${previewSlug}`} target="_blank" rel="noopener">
					Preview ↗
				</a>
			{/if}
			<button type="submit" class="adm-btn adm-btn-primary" disabled={saving}>
				{saving ? 'Menyimpan…' : submitLabel}
			</button>
		</div>
	</div>

	<!-- Editor body -->
	<div class="editor-shell">
		<div
			class="side-toolbar"
			role="toolbar"
			tabindex="-1"
			aria-label="Format toolbar"
			onmousedown={(e) => e.preventDefault()}
		>
			<button
				type="button"
				class="tb"
				disabled={!canUndo}
				onclick={doUndo}
				title="Undo (Ctrl+Z)"
				aria-label="Undo"
			>
				↶
			</button>
			<button
				type="button"
				class="tb"
				disabled={!canRedo}
				onclick={doRedo}
				title="Redo (Ctrl+Y)"
				aria-label="Redo"
			>
				↷
			</button>

			<span class="tb-sep" aria-hidden="true"></span>

			<button
				type="button"
				class="tb"
				class:active={activeStates.bold}
				onclick={() => exec('bold')}
				title="Bold (Ctrl+B)"
				aria-label="Bold"
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.italic}
				onclick={() => exec('italic')}
				title="Italic (Ctrl+I)"
				aria-label="Italic"
			>
				<em>I</em>
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.underline}
				onclick={() => exec('underline')}
				title="Underline (Ctrl+U)"
				aria-label="Underline"
			>
				<u>U</u>
			</button>

			<span class="tb-sep" aria-hidden="true"></span>

			<button
				type="button"
				class="tb"
				class:active={activeStates.h1}
				onclick={() => applyBlock('h1')}
				title="Heading 1"
				aria-label="Heading 1"
			>
				<span class="tb-text">H1</span>
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.h2}
				onclick={() => applyBlock('h2')}
				title="Heading 2"
				aria-label="Heading 2"
			>
				<span class="tb-text">H2</span>
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.h3}
				onclick={() => applyBlock('h3')}
				title="Heading 3"
				aria-label="Heading 3"
			>
				<span class="tb-text">H3</span>
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.quote}
				onclick={() => applyBlock('blockquote')}
				title="Quote"
				aria-label="Blockquote"
			>
				❝
			</button>

			<span class="tb-sep" aria-hidden="true"></span>

			<button
				type="button"
				class="tb"
				class:active={activeStates.ul}
				onclick={() => exec('insertUnorderedList')}
				title="Bullet list"
				aria-label="Bullet list"
			>
				•
			</button>
			<button
				type="button"
				class="tb"
				class:active={activeStates.ol}
				onclick={() => exec('insertOrderedList')}
				title="Numbered list"
				aria-label="Numbered list"
			>
				1.
			</button>

			<span class="tb-sep" aria-hidden="true"></span>

			<button
				type="button"
				class="tb"
				onclick={makeLink}
				title="Insert link"
				aria-label="Insert link"
			>
				🔗
			</button>
			<button
				type="button"
				class="tb"
				onclick={pickInlineImage}
				title="Insert image"
				aria-label="Insert image"
			>
				📷
			</button>

			<span class="tb-sep" aria-hidden="true"></span>

			<button
				type="button"
				class="tb"
				onclick={clearFormatting}
				title="Clear formatting (back to paragraph)"
				aria-label="Clear formatting"
			>
				✕
			</button>
		</div>

		<article class="post-canvas">
			{#if image}
				<div class="cover">
					<img src={image} alt="Cover" />
					<div class="cover-actions">
						<button type="button" class="ghost-btn" onclick={pickCover} disabled={coverUploading}>
							{coverUploading ? '⏳ Uploading…' : 'Ganti cover'}
						</button>
						<button type="button" class="ghost-btn" onclick={() => (image = '')}>
							Hapus cover
						</button>
					</div>
				</div>
			{:else}
				<button
					type="button"
					class="cover-empty"
					onclick={pickCover}
					disabled={coverUploading}
				>
					{coverUploading ? '⏳ Uploading…' : '+ Tambah cover image'}
				</button>
			{/if}
			{#if coverError}<div class="field-error">{coverError}</div>{/if}
			{#if err('image')}<div class="field-error">{err('image')}</div>{/if}

			<div class="meta-row">
				<input
					type="text"
					class="meta-cat"
					placeholder="Kategori"
					bind:value={category}
					maxlength="60"
				/>
				<span class="dot-sep">·</span>
				<input
					type="text"
					class="meta-date"
					placeholder="12 Mei 2026"
					bind:value={date}
					maxlength="40"
				/>
			</div>
			{#if err('category')}<div class="field-error">{err('category')}</div>{/if}
			{#if err('date')}<div class="field-error">{err('date')}</div>{/if}

			<input
				type="text"
				class="title-input"
				placeholder="Judul berita…"
				bind:value={title}
				maxlength="200"
			/>
			{#if err('title')}<div class="field-error">{err('title')}</div>{/if}

			<textarea
				class="excerpt-input"
				placeholder="Ringkasan singkat (muncul di kartu homepage)…"
				bind:value={excerpt}
				rows="2"
				maxlength="500"
			></textarea>
			{#if err('excerpt')}<div class="field-error">{err('excerpt')}</div>{/if}

			<div
				bind:this={bodyEl}
				class="body-edit md-content"
				contenteditable="true"
				role="textbox"
				tabindex="0"
				aria-multiline="true"
				aria-label="Isi berita"
				data-placeholder="Mulai menulis di sini. Pakai toolbar di samping kiri, atau coba: # Judul, ## Sub, - List, > Quote, --- garis, lalu Space/Enter."
				oninput={captureBody}
				onkeydown={onKeyDown}
				onpaste={onPaste}
				ondragover={(e) => e.preventDefault()}
				ondrop={onDrop}
			>
				{@html initialContent || '<p><br></p>'}
			</div>
			{#if err('content')}<div class="field-error">{err('content')}</div>{/if}
		</article>
	</div>
</form>

<style>
	.restore-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 0.875rem 1rem;
		border-radius: 0.625rem;
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(99, 102, 241, 0.1));
		border: 1px solid rgba(56, 189, 248, 0.3);
		color: #e0f2fe;
		margin-bottom: 1rem;
	}

	.rb-text {
		font-size: 0.875rem;
	}

	.rb-actions {
		display: flex;
		gap: 0.5rem;
	}

	.saved-toast {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 999px;
		background: rgba(2, 6, 23, 0.95);
		border: 1px solid rgba(52, 211, 153, 0.4);
		color: #6ee7b7;
		font-size: 0.875rem;
		font-weight: 600;
		z-index: 50;
		box-shadow: 0 12px 30px -10px rgba(2, 6, 23, 0.7);
		animation: toast-in 220ms ease-out;
	}

	.saved-toast .check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 50%;
		background: #34d399;
		color: #022c22;
		font-size: 0.75rem;
		font-weight: 800;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.re-form {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.actionbar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 1.25rem;
		margin: -2.5rem -3rem 1rem;
		background: rgba(2, 6, 23, 0.85);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.15);
		flex-wrap: wrap;
	}

	@media (max-width: 1024px) {
		.actionbar {
			margin: -1.25rem -1.25rem 1rem;
		}
	}

	.ab-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		min-width: 12rem;
	}

	.slug-prefix {
		color: #64748b;
		font-size: 0.8125rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.slug-input {
		flex: 1;
		min-width: 8rem;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #f1f5f9;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		outline: none;
	}

	.slug-input:focus {
		border-color: rgba(56, 189, 248, 0.5);
	}

	.adm-flash.inline {
		margin: 0;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.ab-actions {
		display: flex;
		gap: 0.5rem;
	}

	.autosave {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: #94a3b8;
		font-weight: 500;
		min-height: 1.5rem;
	}

	.autosave .dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #64748b;
	}

	.autosave .dot.saved {
		background: #34d399;
		box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
	}

	.autosave .dot.saving {
		background: #f87171;
		animation: pulse 1.2s ease-in-out infinite;
	}

	.autosave .dot.error {
		background: #fb7185;
	}

	.autosave .dot.idle {
		background: #475569;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50%      { opacity: 0.35; }
	}

	.editor-shell {
		display: grid;
		grid-template-columns: 2.75rem 1fr;
		gap: 1.25rem;
		max-width: calc(720px + 2.75rem + 1.25rem);
		margin: 0 auto;
		padding: 0 0 4rem;
	}

	@media (max-width: 720px) {
		.editor-shell {
			grid-template-columns: 1fr;
		}
	}

	.side-toolbar {
		position: sticky;
		top: 5rem;
		align-self: start;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.375rem;
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.18);
		border-radius: 0.625rem;
		backdrop-filter: blur(8px);
	}

	@media (max-width: 720px) {
		.side-toolbar {
			position: sticky;
			top: 4rem;
			z-index: 15;
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	.tb {
		background: transparent;
		border: 0;
		color: #cbd5e1;
		padding: 0;
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.tb:hover {
		background: rgba(56, 189, 248, 0.12);
		color: #f1f5f9;
	}

	.tb:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.tb:disabled:hover {
		background: transparent;
		color: #cbd5e1;
	}

	.tb.active {
		background: rgba(56, 189, 248, 0.2);
		color: #38bdf8;
	}

	.tb-text {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
	}

	.tb-sep {
		display: block;
		height: 1px;
		background: rgba(148, 163, 184, 0.18);
		margin: 0.25rem 0.125rem;
	}

	@media (max-width: 720px) {
		.tb-sep {
			width: 1px;
			height: 1.25rem;
			margin: 0 0.125rem;
		}
	}

	.post-canvas {
		max-width: 720px;
		color: #e2e8f0;
	}

	.cover {
		position: relative;
		border-radius: 1rem;
		overflow: hidden;
		aspect-ratio: 16/9;
		margin-bottom: 1.5rem;
		background: rgba(15, 23, 42, 0.5);
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.cover-actions {
		position: absolute;
		bottom: 0.625rem;
		right: 0.625rem;
		display: flex;
		gap: 0.375rem;
	}

	.ghost-btn {
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		background: rgba(2, 6, 23, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.25);
		color: #f1f5f9;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		backdrop-filter: blur(8px);
	}

	.ghost-btn:hover:not(:disabled) {
		border-color: rgba(56, 189, 248, 0.5);
	}

	.ghost-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cover-empty {
		display: block;
		width: 100%;
		aspect-ratio: 16/9;
		margin-bottom: 1.5rem;
		border: 2px dashed rgba(148, 163, 184, 0.3);
		border-radius: 1rem;
		background: transparent;
		color: #64748b;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.cover-empty:hover:not(:disabled) {
		border-color: rgba(56, 189, 248, 0.5);
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.04);
	}

	.meta-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.875rem;
	}

	.meta-cat,
	.meta-date {
		padding: 0.125rem 0.25rem;
		border: 0;
		background: transparent;
		color: #e11d48;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		outline: none;
		font-family: inherit;
	}

	.meta-cat {
		min-width: 8rem;
	}

	.meta-date {
		color: #94a3b8;
		min-width: 8rem;
	}

	.meta-cat:focus,
	.meta-date:focus {
		background: rgba(56, 189, 248, 0.06);
		border-radius: 0.25rem;
	}

	.dot-sep {
		color: #475569;
		font-weight: 700;
	}

	.title-input {
		display: block;
		width: 100%;
		padding: 0;
		margin: 0 0 1rem;
		border: 0;
		background: transparent;
		color: #f8fafc;
		font-family: 'Inter', system-ui, sans-serif;
		font-size: clamp(1.875rem, 4vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.15;
		outline: none;
		resize: none;
	}

	.title-input::placeholder {
		color: #475569;
	}

	.excerpt-input {
		display: block;
		width: 100%;
		padding: 0;
		margin: 0 0 2.25rem;
		border: 0;
		background: transparent;
		color: #cbd5e1;
		font-family: inherit;
		font-size: 1.125rem;
		line-height: 1.7;
		outline: none;
		resize: none;
	}

	.excerpt-input::placeholder {
		color: #475569;
	}

	.body-edit {
		min-height: 16rem;
		outline: none;
		font-size: 1.0625rem;
		line-height: 1.75;
		color: #e2e8f0;
	}

	/* Empty placeholder. We render `<p><br></p>` for an empty editor (so
	   the cursor lands somewhere), but visually it's "empty" — show the
	   placeholder hint. The :has() selector is wrapped in :global so
	   svelte-check doesn't strip it. */
	:global(.body-edit:has(> p:only-child:empty))::before,
	:global(.body-edit:has(> p:only-child > br:only-child))::before {
		content: attr(data-placeholder);
		color: #475569;
		font-style: italic;
		display: block;
		pointer-events: none;
	}

	.body-edit:focus {
		outline: none;
	}

	.field-error {
		color: #fda4af;
		font-size: 0.75rem;
		margin: 0.5rem 0;
	}
</style>
