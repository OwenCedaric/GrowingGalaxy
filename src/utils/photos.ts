import { getCollection } from 'astro:content';
import type { PhotoEntry, PhotoImage } from '@/types/photo';
import { SITE_CONFIG } from '@/config';
import { getSlug } from '@/utils/slug';

export function parsePhotoBody(body: string): PhotoImage[] {
    if (!body) return [];

    // Split the body by the image markdown syntax ![alt](url)
    const parts = body.split(/!\[([^\]]*)\]\(([^)]+)\)/);
    const images: PhotoImage[] = [];

    for (let i = 1; i < parts.length; i += 3) {
        const alt = parts[i];
        const url = parts[i + 1];
        const description = parts[i + 2]?.trim();

        images.push({
            url,
            alt: alt || undefined,
            description: description || undefined,
        });
    }

    return images;
}

export async function getPhotos(): Promise<PhotoEntry[]> {
    const collection = await getCollection('photos');

    const photos = collection.map((entry) => {
        const bodyText = entry.body || '';
        const images = parsePhotoBody(bodyText);

        if (!entry.data.name || images.length === 0) {
            throw new Error(`部分照片数据不完整 (slug: ${entry.id})`);
        }

        if (!images[0]?.url) {
            throw new Error(`照片数据格式不正确: 首图 URL 为空 (slug: ${entry.id})`);
        }

        const dateStr = entry.data.date instanceof Date
            ? entry.data.date.toISOString().split('T')[0]
            : String(entry.data.date);

        return {
            slug: entry.id,
            name: entry.data.name,
            date: dateStr,
            author: entry.data.author || SITE_CONFIG.author,
            location: entry.data.location,
            tag: entry.data.tag,
            images,
        } as PhotoEntry;
    });

    // Sort by date descending
    return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
