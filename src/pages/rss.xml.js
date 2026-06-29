import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '@/config';

export async function GET(context) {
    const posts = await getCollection('blog');
    const traces = await getCollection('traces');
    
    const allItems = [
        ...posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.id}/`,
        })),
        ...traces.map((trace) => ({
            title: `Trace: ${trace.data.title.replace(/^SYS_TRACE:\\s*/i, '')}`,
            pubDate: trace.data.endDate,
            description: trace.data.baseline.environment,
            link: `/traces/${trace.id}/`,
        }))
    ];

    allItems.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

    return rss({
        title: SITE_CONFIG.title, 
        description: SITE_CONFIG.description,
        site: context.site || SITE_CONFIG.site, 
        items: allItems,
    });
}
