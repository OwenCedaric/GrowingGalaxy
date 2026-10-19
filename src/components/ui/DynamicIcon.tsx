import React from 'react';
import * as RemixIcons from '@remixicon/react';

interface DynamicIconProps {
    name: string;
    className?: string;
    fallback?: React.ComponentType<{ className?: string }>;
}

// Common aliases and special casings mapping for seamless resolution
const aliasMap: Record<string, string> = {
    // Social & Elsewhere platforms
    x: 'TwitterX',
    twitter: 'TwitterX',
    mail: 'Mail',
    email: 'Mail',
    rss: 'Rss',
    feed: 'Rss',
    web: 'Global',
    website: 'Global',
    site: 'Global',
    blog: 'Article',
    youtube: 'Youtube',
    linkedin: 'Linkedin',
    github: 'Github',
    instagram: 'Instagram',
    bilibili: 'Bilibili',
    zhihu: 'Zhihu',
    telegram: 'Telegram',
    discord: 'Discord',
    threads: 'Threads',
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
    spotify: 'Spotify',
    weibo: 'Weibo',
    wechat: 'Wechat',
    'wechat-channels': 'WechatChannels',
    'wechat-channel': 'WechatChannels',
    channels: 'WechatChannels',
    'wechat-pay': 'WechatPay',
    figma: 'Figma',
    unsplash: 'Unsplash',
    medium: 'Medium',
    reddit: 'Reddit',

    // Works & Projects concepts
    galaxy: 'Planet',
    planet: 'Planet',
    code: 'CodeSSlash',
    terminal: 'TerminalBox',
    system: 'Cpu',
    app: 'Apps2',
    tool: 'Tools',
    design: 'Palette',
    archive: 'ArchiveDrawer',
    repo: 'GitRepository',
    experiment: 'Flask',
    camera: 'Camera3',
    photo: 'Image',
    music: 'Music2',
    stack: 'Stack',
};

export default function DynamicIcon({
    name,
    className = 'w-4 h-4',
    fallback: CustomFallback,
}: DynamicIconProps) {
    const raw = (name || '').trim();
    const DefaultFallback = CustomFallback || RemixIcons.RiFolder3Line;

    if (!raw) {
        return <DefaultFallback className={className} />;
    }

    const lowerClean = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lowerKebab = raw.toLowerCase().replace(/[_\s/]+/g, '-');

    // 1. Direct or alias resolution
    const brandFromAlias =
        aliasMap[raw.toLowerCase()] ||
        aliasMap[lowerKebab] ||
        aliasMap[lowerClean];

    // 2. Multi-word PascalCase conversion (e.g. "wechat-channels" -> "WechatChannels")
    const words = raw.split(/[-_\s/]+/);
    const pascal = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');

    // Check if the last or first word maps to an alias (e.g. "Growing Galaxy" -> "galaxy" -> "Planet")
    const lastWordAlias = words.length > 1 ? aliasMap[words[words.length - 1].toLowerCase()] : undefined;
    const firstWordAlias = words.length > 1 ? aliasMap[words[0].toLowerCase()] : undefined;

    // 3. Fallback raw capitalized
    const rawCapitalized =
        raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[^a-zA-Z0-9]/g, '');

    const candidateBases = [
        brandFromAlias,
        pascal,
        lastWordAlias,
        firstWordAlias,
        rawCapitalized,
        raw,
    ].filter(Boolean) as string[];

    const iconRegistry = RemixIcons as Record<string, React.ComponentType<{ className?: string }>>;

    for (const base of candidateBases) {
        const candidateKeys = [
            base,
            `${base}Line`,
            `${base}Fill`,
            `Ri${base}`,
            `Ri${base}Line`,
            `Ri${base}Fill`,
            `Ri${base}BoxLine`,
            `Ri${base}BoxFill`,
        ];

        for (const key of candidateKeys) {
            const IconComponent = iconRegistry[key];
            if (IconComponent) {
                return <IconComponent className={className} />;
            }
        }
    }

    return <DefaultFallback className={className} />;
}
