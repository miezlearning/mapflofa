import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';
import { programsRepo } from '$lib/server/repositories/programs';

vi.mock('$lib/server/repositories/programs', () => ({
	programsRepo: {
		findById: vi.fn(),
		list: vi.fn()
	}
}));

const findById = vi.mocked(programsRepo.findById);
const list = vi.mocked(programsRepo.list);

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

describe('/programs/[id] load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads program detail data for a valid id', async () => {
		const program = {
			id: 3,
			title: 'Musik & Pertunjukan',
			tag: 'Seni',
			excerpt: 'Wadah ekspresi siswa.',
			image: 'https://example.com/music.jpg',
			post: 'Latihan ansambel dan pentas seni.',
			...emptyProgramDetails,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-01T00:00:00.000Z')
		};
		const otherProgram = {
			id: 4,
			title: 'Robotik',
			tag: 'Teknologi',
			excerpt: 'Merakit masa depan.',
			image: 'https://example.com/robot.jpg',
			post: 'Belajar IoT.',
			...emptyProgramDetails,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-01T00:00:00.000Z')
		};
		findById.mockResolvedValueOnce(program);
		list.mockResolvedValueOnce({
			rows: [program, otherProgram],
			total: 2
		});

		await expect(load({ params: { id: '3' } } as Parameters<typeof load>[0])).resolves.toEqual({
			program,
			relatedPrograms: [otherProgram]
		});
		expect(findById).toHaveBeenCalledWith(3);
		expect(list).toHaveBeenCalledWith({ limit: 4, offset: 0 });
	});

	it('throws 400 for malformed ids', async () => {
		await expect(load({ params: { id: 'bad' } } as Parameters<typeof load>[0])).rejects.toMatchObject({
			status: 400
		});
		expect(findById).not.toHaveBeenCalled();
	});

	it('throws 404 when the program does not exist', async () => {
		findById.mockResolvedValueOnce(null as never);

		await expect(load({ params: { id: '81' } } as Parameters<typeof load>[0])).rejects.toMatchObject({
			status: 404
		});
		expect(findById).toHaveBeenCalledWith(81);
	});
});
