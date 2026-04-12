export const SITE_CONFIG = {
    title: "Galaxy",
    description: "A curated space for digital galleries and storytelling.",
    author: "Cedar",
    site: "https://galaxy.ceda.is",
    imageServer: ["https://images.pexels.com"],
    postsPerPage: 6,
    defaultImage: "/blog-placeholder-1.png",
    nav: [
        { text: "Blog", href: "/blog" },
        { text: "Gallery", href: "/gallery" },
        { text: "About", href: "/about" },
    ],
    homepage: {
        title: "I'm DG.",
        subtitle: "Doctor.",
        description: [
            "Exploring the intersection of design, technology, and human experience through a minimalist lens. Growing Galaxy is a digital garden for curated blog and visual experiments.",
            "Every pixel is placed with intention. Every interaction is designed to be felt, not just seen. Welcome to a sanctuary of digital calmness."
        ],
        links: [
            { text: "Read the blog", href: "/blog" },
            { text: "View the gallery", href: "/gallery" }
        ]
    },
    footer: {
        social: [
            { text: "RSS", href: "/rss.xml" },
            { text: "Blogroll", href: "/blogroll" },
            { text: "GitHub", href: "https://github.com/OwenCedaric" },
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
