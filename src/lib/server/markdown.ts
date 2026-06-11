/**
 * Content sanitization + processing.
 *
 * News post bodies are stored as HTML (produced by the WYSIWYG editor in
 * /admin/news/*). On render we:
 *
 *   1. Sanitize the stored HTML one more time (defense in depth).
 *   2. Inject `id` attributes onto h2/h3/h4 so the TOC anchor links work.
 *   3. Build the TOC tree from those headings.
 *   4. Compute a word count and reading time.
 *
 * The same sanitize whitelist is used on save so the editor can't smuggle
 * dangerous markup in either.
 */
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
	allowedTags: [
		'p', 'br', 'hr',
		'strong', 'em', 'u', 's', 'b', 'i', 'code', 'pre', 'blockquote',
		'ul', 'ol', 'li',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'a',
		'img', 'figure', 'figcaption',
		'table', 'thead', 'tbody', 'tr', 'th', 'td',
		'div', 'span'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel'],
		img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
		figure: ['class'],
		// Headings need `id` for the TOC; we set it below in `processForReading`.
		h1: ['id'],
		h2: ['id'],
		h3: ['id'],
		h4: ['id'],
		h5: ['id'],
		h6: ['id'],
		'*': []
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	allowedSchemesByTag: { img: ['http', 'https', 'data'] },
	transformTags: {
		a: (tagName, attribs) => ({
			tagName,
			attribs: {
				...attribs,
				rel: 'noopener noreferrer',
				target: attribs.href?.startsWith('http') ? '_blank' : '_self'
			}
		}),
		img: (tagName, attribs) => ({
			tagName,
			attribs: {
				...attribs,
				alt: attribs.alt ?? '',
				loading: 'lazy'
			}
		})
	}
};

export function renderContent(html: string | null | undefined): string {
	if (!html) return '';
	return sanitizeHtml(html, SANITIZE_OPTS);
}

export function sanitizeForStorage(html: string): string {
	return sanitizeHtml(html, SANITIZE_OPTS);
}

// ---------------------------------------------------------------------
// TOC + reading-time pipeline
// ---------------------------------------------------------------------

export type TocItem = { level: 1 | 2 | 3 | 4; text: string; id: string };
export type ReadingMeta = {
	html: string;
	toc: TocItem[];
	wordCount: number;
	readingMinutes: number;
};

function slugify(input: string, taken: Set<string>): string {
	let base = input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
	if (!base) base = 'section';
	let candidate = base;
	let n = 2;
	while (taken.has(candidate)) {
		candidate = `${base}-${n}`;
		n++;
	}
	taken.add(candidate);
	return candidate;
}

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'");
}

function stripTags(s: string): string {
	return decodeEntities(s.replace(/<[^>]+>/g, '')).trim();
}

/**
 * Walk through the sanitized HTML, inject heading ids, collect TOC items,
 * and count words. Single regex pass, no DOM.
 */
export function processContent(rawHtml: string | null | undefined): ReadingMeta {
	const sanitized = renderContent(rawHtml);
	if (!sanitized) {
		return { html: '', toc: [], wordCount: 0, readingMinutes: 0 };
	}

	const taken = new Set<string>();
	const toc: TocItem[] = [];

	// Replace heading tags h1/h2/h3/h4 with the same tag + id.
	const html = sanitized.replace(
		/<h([1234])([^>]*)>([\s\S]*?)<\/h\1>/gi,
		(_match, level, attrs, inner) => {
			const text = stripTags(inner);
			if (!text) return _match;
			// If an id is already present, keep it.
			const idMatch = / id\s*=\s*["']([^"']+)["']/i.exec(attrs);
			let id: string;
			if (idMatch) {
				id = idMatch[1];
				taken.add(id);
			} else {
				id = slugify(text, taken);
				attrs = `${attrs} id="${id}"`;
			}
			toc.push({ level: Number(level) as 1 | 2 | 3 | 4, text, id });
			return `<h${level}${attrs}>${inner}</h${level}>`;
		}
	);

	// Word count: strip all tags, decode entities, split on whitespace.
	const text = stripTags(sanitized);
	const words = text.length === 0 ? 0 : text.split(/\s+/).length;
	// Indonesian average reading speed ~ 200 wpm. Round up to whole minutes.
	const readingMinutes = Math.max(1, Math.ceil(words / 200));

	return { html, toc, wordCount: words, readingMinutes };
}
