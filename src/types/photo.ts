export interface PhotoImage {
    url: string;
    alt?: string;
    description?: string;
}

export interface PhotoEntry {
    slug: string;
    name: string;
    date: string;
    author: string;
    location?: string;
    tag?: string[];
    images: PhotoImage[];
}
