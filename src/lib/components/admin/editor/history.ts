/**
 * Custom undo/redo for the contenteditable editor.
 *
 * Why not use the browser's native Ctrl+Z?
 *
 *   The browser only tracks operations that go through `document.execCommand`
 *   or direct typing. Our editor also performs structural DOM manipulations
 *   directly (markdown shortcuts that clear a block's textContent, the
 *   "Enter after heading" handler that inserts a fresh <p>, etc.). Those
 *   would be invisible to the native undo stack and produce confusing
 *   half-undone states.
 *
 *   The custom stack here snapshots {html, selection} BEFORE every
 *   structural change and AFTER every meaningful settle (debounced for
 *   typing). That keeps Ctrl+Z behavior consistent with what the user
 *   actually sees.
 */

const MAX_DEPTH = 50;

/**
 * A path-based selection descriptor that survives DOM serialization.
 * `path` is a list of child indexes from `bodyEl` down to the leaf node.
 */
type SerSel = {
	startPath: number[];
	startOffset: number;
	endPath: number[];
	endOffset: number;
};

export type Snapshot = {
	html: string;
	sel: SerSel | null;
};

function pathTo(host: HTMLElement, node: Node): number[] | null {
	const path: number[] = [];
	let n: Node | null = node;
	while (n && n !== host) {
		const parent: Node | null = n.parentNode;
		if (!parent) return null;
		const idx = Array.prototype.indexOf.call(parent.childNodes, n);
		if (idx < 0) return null;
		path.unshift(idx);
		n = parent;
	}
	if (n !== host) return null;
	return path;
}

function nodeAt(host: HTMLElement, path: number[]): Node | null {
	let n: Node = host;
	for (const idx of path) {
		if (!n.childNodes[idx]) return null;
		n = n.childNodes[idx];
	}
	return n;
}

export function captureSelection(host: HTMLElement): SerSel | null {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;
	const r = sel.getRangeAt(0);
	if (!host.contains(r.startContainer) || !host.contains(r.endContainer)) return null;
	const startPath = pathTo(host, r.startContainer);
	const endPath = pathTo(host, r.endContainer);
	if (!startPath || !endPath) return null;
	return {
		startPath,
		startOffset: Math.min(r.startOffset, r.startContainer.nodeType === 3 ? (r.startContainer as Text).length : r.startContainer.childNodes.length),
		endPath,
		endOffset: Math.min(r.endOffset, r.endContainer.nodeType === 3 ? (r.endContainer as Text).length : r.endContainer.childNodes.length)
	};
}

export function restoreSelection(host: HTMLElement, ser: SerSel | null): void {
	if (!ser) return;
	const startNode = nodeAt(host, ser.startPath);
	const endNode = nodeAt(host, ser.endPath);
	if (!startNode || !endNode) {
		// Fallback: caret to end.
		const sel = window.getSelection();
		if (!sel) return;
		const range = document.createRange();
		range.selectNodeContents(host);
		range.collapse(false);
		sel.removeAllRanges();
		sel.addRange(range);
		return;
	}
	try {
		const range = document.createRange();
		const startMax =
			startNode.nodeType === 3
				? (startNode as Text).length
				: startNode.childNodes.length;
		const endMax =
			endNode.nodeType === 3 ? (endNode as Text).length : endNode.childNodes.length;
		range.setStart(startNode, Math.min(ser.startOffset, startMax));
		range.setEnd(endNode, Math.min(ser.endOffset, endMax));
		const sel = window.getSelection();
		if (!sel) return;
		sel.removeAllRanges();
		sel.addRange(range);
	} catch {
		// Range out of bounds — give up gracefully.
	}
}

export class EditorHistory {
	private past: Snapshot[] = [];
	private future: Snapshot[] = [];
	private current: Snapshot | null = null;

	get canUndo(): boolean {
		return this.past.length > 0;
	}
	get canRedo(): boolean {
		return this.future.length > 0;
	}

	/** Replace the entire history with a single baseline snapshot. */
	reset(snap: Snapshot): void {
		this.past = [];
		this.future = [];
		this.current = snap;
	}

	/**
	 * Push a new state on top of `current`. The previous `current` (if any)
	 * is moved to `past`. The redo stack is cleared.
	 */
	push(snap: Snapshot): void {
		// Skip identical-html dupes so rapid coalesced commits don't bloat memory.
		if (this.current && this.current.html === snap.html) {
			this.current = snap; // refresh selection only
			return;
		}
		if (this.current) this.past.push(this.current);
		if (this.past.length > MAX_DEPTH) this.past.shift();
		this.current = snap;
		this.future = [];
	}

	undo(): Snapshot | null {
		if (this.past.length === 0) return null;
		if (this.current) this.future.push(this.current);
		this.current = this.past.pop()!;
		return this.current;
	}

	redo(): Snapshot | null {
		if (this.future.length === 0) return null;
		if (this.current) this.past.push(this.current);
		this.current = this.future.pop()!;
		return this.current;
	}
}
