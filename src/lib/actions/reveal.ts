/**
 * Reveal-on-scroll action.
 * Adds `is-revealed` once visible, plus a directional variant class.
 *
 * Usage:
 *   <div use:reveal>            -> from = 'up' (default), delay = 0
 *   <div use:reveal={{ from: 'left', delay: 120 }}>
 */
type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'scale';

export function reveal(
	node: HTMLElement,
	options: { delay?: number; threshold?: number; from?: RevealFrom } = {}
) {
	const { delay = 0, threshold = 0.12, from = 'up' } = options;

	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		node.classList.add('is-revealed');
		return { destroy() {} };
	}

	if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);
	node.classList.add('reveal', `reveal-${from}`);

	const obs = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.classList.add('is-revealed');
					obs.unobserve(node);
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -6% 0px' }
	);
	obs.observe(node);

	return {
		destroy() {
			obs.disconnect();
		}
	};
}
