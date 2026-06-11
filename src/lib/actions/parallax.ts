/**
 * Parallax scroll action.
 * Translates the element vertically based on its position relative to the viewport.
 *
 * - Uses requestAnimationFrame + a single global scroll listener for performance.
 * - Skips work entirely when the element is offscreen.
 * - Respects prefers-reduced-motion.
 *
 * Usage:
 *   <img use:parallax={{ speed: -0.15 }}>     // slow downward drift on scroll
 *   <div use:parallax={{ speed: 0.2 }}>       // upward drift
 *
 * speed: a small number between -0.5 and 0.5 works best.
 *        positive  -> element moves UP as page scrolls down (foreground feel)
 *        negative  -> element moves DOWN as page scrolls down (background feel)
 */
type Options = { speed?: number };

let registry: Array<{ el: HTMLElement; speed: number }> = [];
let rafId: number | null = null;
let listening = false;
let reducedMotion = false;

function tick() {
	rafId = null;
	const vh = window.innerHeight;
	for (const { el, speed } of registry) {
		const rect = el.getBoundingClientRect();
		// Skip offscreen elements
		if (rect.bottom < -200 || rect.top > vh + 200) continue;
		// Distance from element center to viewport center, normalized
		const center = rect.top + rect.height / 2;
		const offset = center - vh / 2;
		const ty = -offset * speed;
		el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
	}
}

function schedule() {
	if (rafId == null) rafId = requestAnimationFrame(tick);
}

function ensureListening() {
	if (listening) return;
	listening = true;
	reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reducedMotion) return;
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	schedule();
}

export function parallax(node: HTMLElement, options: Options = {}) {
	const speed = options.speed ?? 0.15;
	if (typeof window === 'undefined') return { destroy() {} };
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return { destroy() {} };
	}
	node.style.willChange = 'transform';
	registry.push({ el: node, speed });
	ensureListening();
	schedule();

	return {
		update(newOptions: Options = {}) {
			const entry = registry.find((r) => r.el === node);
			if (entry) entry.speed = newOptions.speed ?? 0.15;
			schedule();
		},
		destroy() {
			registry = registry.filter((r) => r.el !== node);
			node.style.willChange = '';
			node.style.transform = '';
		}
	};
}
