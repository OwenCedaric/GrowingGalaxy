export const SITE_CONFIG = {
    title: "Galaxy",
    description: "A curated space for digital galleries and storytelling.",
    author: "Cedar",
    signature: "Owen Cedar",
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
            { text: "Blogroll", href: "/blogroll" },
            { text: "RSS", href: "/rss.xml" },
            { text: "X", href: "https://x.com/OwenCedaric" }
        ],
        copyright: "Growing Galaxy. Designed with intention."
    },
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
