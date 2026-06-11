import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './+server';
import { programsRepo } from '$lib/server/repositories/programs';

vi.mock('$lib/server/repositories/programs', () => ({
	programsRepo: {
		findById: vi.fn()
	}
}));

vi.mock('$lib/server/api/rate-limit', () => ({
	rateLimit: vi.fn(() => null)
}));

const findById = vi.mocked(programsRepo.findById);

const emptyProgramDetails = {
	audience: null,
	schedule: null,
	location: null,
	mentor: null,
	capacity: null,
	contact: null,
	registration: null,
	highlights: null,
	outcomes: null,
	activities: null,
	requirements: null
};

function eventFor(id: string): Parameters<typeof GET>[0] {
	return {
		params: { id },
		setHeaders: vi.fn(),
		getClientAddress: () => '127.0.0.1'
	} as unknown as Parameters<typeof GET>[0];
}

describe('GET /api/programs/[id]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns one program for a valid id', async () => {
		findById.mockResolvedValueOnce({
			id: 7,
			title: 'Coding & Robotik',
			tag: 'Teknologi',
			excerpt: 'Belajar komputasi lewat praktik.',
			image: 'https://example.com/program.jpg',
			post: null,
			...emptyProgramDetails,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-01T00:00:00.000Z')
		});

		const response = await GET(eventFor('7'));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(findById).toHaveBeenCalledWith(7);
		expect(body).toMatchObject({
			ok: true,
			data: {
				id: 7,
				title: 'Coding & Robotik'
			}
		});
	});

	it('returns 400 for malformed ids', async () => {
		const response = await GET(eventFor('abc'));
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(findById).not.toHaveBeenCalled();
		expect(body).toMatchObject({
			ok: false,
			error: {
				code: 'BAD_REQUEST'
			}
		});
	});

	it('returns 404 for valid ids that do not exist', async () => {
		findById.mockResolvedValueOnce(null as never);

		const response = await GET(eventFor('99'));
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(findById).toHaveBeenCalledWith(99);
		expect(body).toMatchObject({
			ok: false,
			error: {
				code: 'NOT_FOUND'
			}
		});
	});
});
