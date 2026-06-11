/**
 * Selection helpers for the contenteditable editor.
 *
 * Toolbar buttons are OUTSIDE the contenteditable region, which means clicking
 * them removes the selection from the body. We work around this by stashing
 * the last known selection range while the user works inside the editor and
 * restoring it before each format command.
 */

let savedRange: Range | null = null;
let savedHost: HTMLElement | null = null;

/** Snapshot the current selection if (and only if) it lives inside `host`. */
export function remember(host: HTMLElement): void {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return;
	const r = sel.getRangeAt(0);
	if (host.contains(r.commonAncestorContainer)) {
		savedRange = r.cloneRange();
		savedHost = host;
	}
}

/**
 * Restore the previous selection. If we don't have one (e.g. user just opened
 * the editor and clicks a toolbar button), place the cursor at the end of
 * `host` so commands have somewhere to operate on.
 */
export function restore(host: HTMLElement): void {
	host.focus();
	const sel = window.getSelection();
	if (!sel) return;

	if (savedRange && savedHost === host && host.contains(savedRange.commonAncestorContainer)) {
		sel.removeAllRanges();
		sel.addRange(savedRange);
		return;
	}

	// Fallback: caret to end of last child.
	const range = document.createRange();
	range.selectNodeContents(host);
	range.collapse(false);
	sel.removeAllRanges();
	sel.addRange(range);
}

/** Walk up from the current selection to find the wrapping block element. */
export function currentBlock(host: HTMLElement): HTMLElement | null {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;
	let node: Node | null = sel.getRangeAt(0).startContainer;
	while (node && node !== host) {
		if (
			node.nodeType === 1 &&
			/^(P|H1|H2|H3|H4|H5|H6|LI|BLOCKQUOTE|PRE|FIGURE)$/.test((node as Element).tagName)
		) {
			return node as HTMLElement;
		}
		node = node.parentNode;
	}
	return null;
}

/**
 * Normalize the editor so every direct child is a block-level element.
 * Tailwind preflight + browser quirks sometimes leave naked text nodes or
 * `<br>` floating directly under the contenteditable. Wrapping them in a
 * `<p>` keeps `formatBlock` and our markdown shortcuts working.
 */
export function normalizeBlocks(host: HTMLElement): void {
	if (!host.firstChild) {
		host.innerHTML = '<p><br></p>';
		return;
	}
	let buffer: Node[] = [];
	const flush = (before: Node | null) => {
		if (buffer.length === 0) return;
		const p = document.createElement('p');
		for (const n of buffer) p.appendChild(n);
		host.insertBefore(p, before);
		buffer = [];
	};
	for (const child of Array.from(host.childNodes)) {
		if (
			child.nodeType === 1 &&
			/^(P|H1|H2|H3|H4|H5|H6|UL|OL|BLOCKQUOTE|PRE|HR|FIGURE|DIV|TABLE)$/.test(
				(child as Element).tagName
			)
		) {
			flush(child);
		} else {
			buffer.push(child);
		}
	}
	flush(null);
}

/** Move the caret to start of the given element. */
export function caretToStart(el: HTMLElement): void {
	const sel = window.getSelection();
	if (!sel) return;
	const range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}

/** Move the caret to end of the given element. */
export function caretToEnd(el: HTMLElement): void {
	const sel = window.getSelection();
	if (!sel) return;
	const range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	sel.removeAllRanges();
	sel.addRange(range);
}

/** True if the selection is collapsed at the END of `block`. */
export function isCaretAtEndOf(block: HTMLElement): boolean {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
	const range = sel.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(block);
	r.setStart(range.endContainer, range.endOffset);
	// If the remaining content after the caret is whitespace-only, treat as end.
	return r.toString().trim().length === 0;
}
