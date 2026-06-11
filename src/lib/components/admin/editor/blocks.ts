/**
 * Block-level operations for the contenteditable editor.
 *
 * The browser's built-in `document.execCommand('formatBlock', ...)` has a
 * famous bug: applying a heading on top of an existing heading nests them
 * (e.g. `<h2><h2>text</h2></h2>`). Our CSS uses `font-size: 1.4em` for h2,
 * so each nesting level multiplies the size — that's the "stacked / bigger
 * with each click" symptom users were seeing.
 *
 * This module replaces formatBlock with a clean implementation:
 *   - Collect every top-level block intersecting the selection.
 *   - Decide a single target tag (toggle vs apply).
 *   - Re-create each block with the target tag, moving children over.
 *   - Flatten any leftover nested headings as a safety pass.
 */

const BLOCK_RE = /^(P|H1|H2|H3|H4|H5|H6|BLOCKQUOTE|LI|PRE|FIGURE|DIV)$/;

function isBlock(node: Node): node is HTMLElement {
	return node.nodeType === 1 && BLOCK_RE.test((node as Element).tagName);
}

/** Walk up to the nearest block-level ancestor inside `host`. */
function blockAncestor(host: HTMLElement, node: Node | null): HTMLElement | null {
	let n: Node | null = node;
	while (n && n !== host) {
		if (isBlock(n)) return n as HTMLElement;
		n = n.parentNode;
	}
	return null;
}

/**
 * All top-level blocks within `host` that the current selection touches.
 * "Top-level" means: direct child of `host`, OR a `<li>` inside a list.
 *
 * Returns an empty array if there's no selection inside the editor.
 */
function collectSelectedBlocks(host: HTMLElement): HTMLElement[] {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return [];
	const range = sel.getRangeAt(0);
	if (!host.contains(range.commonAncestorContainer)) return [];

	const startBlock = blockAncestor(host, range.startContainer);
	const endBlock = blockAncestor(host, range.endContainer);
	if (!startBlock || !endBlock) return [];

	if (startBlock === endBlock) return [startBlock];

	// Ascend to the nearest blocks that share a common parent so we can walk
	// linearly between them.
	const findCommon = (a: HTMLElement, b: HTMLElement): { a: HTMLElement; b: HTMLElement } => {
		// Bring both up to direct children of host (or li peers in same ul/ol).
		while (a.parentElement && a.parentElement !== host && !isPeerContainer(a.parentElement)) {
			a = a.parentElement;
		}
		while (b.parentElement && b.parentElement !== host && !isPeerContainer(b.parentElement)) {
			b = b.parentElement;
		}
		return { a, b };
	};

	const { a, b } = findCommon(startBlock, endBlock);

	const result: HTMLElement[] = [];
	let cur: HTMLElement | null = a;
	while (cur) {
		if (isBlock(cur)) result.push(cur);
		if (cur === b) break;
		cur = cur.nextElementSibling as HTMLElement | null;
	}
	if (result.length === 0) result.push(startBlock);
	return result;
}

function isPeerContainer(el: Element): boolean {
	return el.tagName === 'UL' || el.tagName === 'OL';
}

/**
 * Replace `block` with a new element of `tagName`, moving over all children.
 * Returns the new element. The original is removed from the DOM.
 *
 * Special case for list items: a heading on a `<li>` doesn't make sense, so
 * we lift the new heading OUT of the list and remove the now-empty list if
 * it has no other children.
 */
function replaceBlock(block: HTMLElement, tagName: string): HTMLElement {
	const next = document.createElement(tagName);
	while (block.firstChild) next.appendChild(block.firstChild);
	if (next.childNodes.length === 0) next.appendChild(document.createElement('br'));

	if (block.tagName === 'LI') {
		// Lift the heading out of the list, before the parent list element.
		const list = block.parentElement;
		if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
			list.parentElement?.insertBefore(next, list);
			list.removeChild(block);
			if (list.children.length === 0) list.remove();
			return next;
		}
	}

	block.replaceWith(next);
	return next;
}

/**
 * Recursively unwrap any heading nested inside another heading (or
 * blockquote inside blockquote, etc). Run as a safety pass after every
 * block operation.
 */
export function flattenNested(host: HTMLElement): void {
	const selectors = [
		'h1 h1','h1 h2','h1 h3','h1 h4','h1 h5','h1 h6',
		'h2 h1','h2 h2','h2 h3','h2 h4','h2 h5','h2 h6',
		'h3 h1','h3 h2','h3 h3','h3 h4','h3 h5','h3 h6',
		'h4 h1','h4 h2','h4 h3','h4 h4','h4 h5','h4 h6',
		'h5 h1','h5 h2','h5 h3','h5 h4','h5 h5','h5 h6',
		'h6 h1','h6 h2','h6 h3','h6 h4','h6 h5','h6 h6',
		'blockquote blockquote'
	].join(',');

	let safety = 10;
	while (safety-- > 0) {
		const inner = host.querySelector(selectors);
		if (!inner) break;
		const parent = inner.parentNode;
		if (!parent) break;
		while (inner.firstChild) parent.insertBefore(inner.firstChild, inner);
		parent.removeChild(inner);
	}
}

export type BlockTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';

/**
 * Apply (or toggle) the given block tag across every block in the current
 * selection. If every selected block already has the target tag, toggle
 * back to `<p>`.
 *
 * Returns the new blocks so the caller can move the caret if needed.
 */
export function setBlockTag(host: HTMLElement, target: BlockTag): HTMLElement[] {
	flattenNested(host); // start clean

	const blocks = collectSelectedBlocks(host);
	if (blocks.length === 0) return [];

	const upper = target.toUpperCase();
	const allMatch = blocks.every((b) => b.tagName === upper);
	const finalTag = allMatch ? 'P' : upper;

	const newBlocks: HTMLElement[] = [];
	for (const block of blocks) {
		// Skip if it's already the target — avoids unnecessary DOM churn.
		if (block.tagName === finalTag) {
			newBlocks.push(block);
			continue;
		}
		newBlocks.push(replaceBlock(block, finalTag));
	}

	flattenNested(host); // safety pass — should be a no-op if everything went well

	// Re-anchor the selection across the freshly created blocks so the user's
	// caret/highlight stays where it was.
	if (newBlocks.length > 0) {
		try {
			const range = document.createRange();
			range.setStart(newBlocks[0], 0);
			range.setEnd(newBlocks[newBlocks.length - 1], newBlocks[newBlocks.length - 1].childNodes.length);
			const sel = window.getSelection();
			if (sel) {
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} catch {
			// Range may fail if the new block has no contents — non-fatal.
		}
	}

	return newBlocks;
}

/**
 * True if every block in the current selection has the given tag.
 * Useful for the toolbar's active-state highlight.
 */
export function selectionMatchesTag(host: HTMLElement, target: BlockTag): boolean {
	const blocks = collectSelectedBlocks(host);
	if (blocks.length === 0) return false;
	const upper = target.toUpperCase();
	return blocks.every((b) => b.tagName === upper);
}
