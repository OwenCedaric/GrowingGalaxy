import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '@/config';

export async function GET(context) {
    const posts = await getCollection('blog');
    return rss({
        title: SITE_CONFIG.title, 
        description: SITE_CONFIG.description,
        site: context.site || SITE_CONFIG.site, 
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.id}/`,
        })),
    });
}
