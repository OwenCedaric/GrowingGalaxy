export const SITE_CONFIG = {
    title: "Galaxy",
    logoSrc: "/favicon.svg",
    description: "A curated space for digital galleries and storytelling.",
    author: "DG",
    signature: "DGX",
    site: "https://galaxy.ceda.is",
    imageServer: ["https://images.pexels.com"],
    postsPerPage: 6,
    projectsPerPage: 12,
    defaultImage: "/blog-placeholder-1.png",
    nav: [
        { text: "Blog", href: "/blog" },
        {
            text: "Gallery",
            href: "/gallery",
            children: [
                { text: "2025", href: "/gallery/2025/shinjukugyoencherryblossoms" }
            ]
        },
        { text: "Traces", href: "/traces" },
    ],
    homepage: {
        harmonicSystem: {
            seed: 2026,
            speed: 0.0042
        },
        links: [
            { text: "Read the blog", href: "/blog" },
            { text: "Explore the Traces", href: "/traces" }
        ]
    },
    footer: {
        social: [
            { text: "Projects", href: "/projects" },
            { text: "Elsewhere", href: "/elsewhere" },
            { text: "RSS", href: "/rss.xml" },
        ],
        copyright: "Growing Galaxy. Designed with intention."
    },
    elsewhere: [
        {
            name: "X",
            handle: "@OwenCedaric",
            url: "https://x.com/OwenCedaric",
        },
        {
            name: "GitHub",
            handle: "OwenCedaric",
            url: "https://github.com/OwenCedaric",
        },
        {
            name: "Instagram",
            handle: "@OwenCedaric",
            url: "https://instagram.com/OwenCedaric",
        },
        {
            name: "Mail",
            handle: "hello@ceda.is",
            url: "mailto:hello@ceda.is",
        }
    ],
    articleCopyright: {
        enabled: true,
        declaration: "No part of this article may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author.",
        proof: {
            enabled: true,
            linkText: "Verify Authenticity",
            baseUrl: "https://proofs.ceda.is",
            mode: "dynamic" // 'static' uses baseUrl as is, 'dynamic' appends '/blog/[slug]'
        }
    }
};
