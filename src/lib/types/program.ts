export interface ProgramPreview {
	id: number;
	tag: string;
	title: string;
	excerpt: string;
	image: string;
	audience?: string | null;
	schedule?: string | null;
	location?: string | null;
}
