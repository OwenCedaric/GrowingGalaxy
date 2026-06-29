import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

export default function rehypeTracesBrutalism() {
    return (tree: any, file: any) => {
        const filePath = file.path || (file.history && file.history[0]) || '';
        // Only run for traces
        if (!filePath.includes('/content/traces/')) {
            return;
        }

        // 1. Hijack Headers
        visit(tree, 'element', (node) => {
            if (node.tagName === 'h2' || node.tagName === 'h3') {
                const text = toString(node);
                const cleanedText = text.replace(/^\[\s*/, '').replace(/\s*\]$/, '');
                node.children = [{ type: 'text', value: cleanedText }];
                
                node.properties = node.properties || {};
                node.properties.className = [
                    ...(node.properties.className || []),
                    'font-sans', 'border-b', 'border-black/10', 'dark:border-white/10', 'pb-2', 'mb-6', 'mt-10', 'text-lg', 'font-bold'
                ];
            }
        });

        // 2. Hijack Images and their wrapper <p>
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName === 'p') {
                // Check if this <p> contains exactly one <img> and maybe some whitespace text
                const imgChild = node.children.find((c: any) => c.type === 'element' && c.tagName === 'img');
                const hasTextContent = node.children.some((c: any) => c.type === 'text' && c.value.trim() !== '');
                
                if (imgChild && !hasTextContent) {
                    // It's an image wrapper <p>. We change it to a <div>
                    node.tagName = 'div';
                    node.properties = {
                        className: ['relative', 'block', 'w-full', 'mb-2', 'traces-image-wrapper'] // traces-image-wrapper used as a marker
                    };
                    
                    const newImgNode = {
                        type: 'element',
                        tagName: 'img',
                        properties: {
                            ...imgChild.properties,
                            className: ['w-full', 'h-auto', 'object-cover', 'rounded-lg']
                        },
                        children: []
                    };
                    
                    node.children = [newImgNode];
                }
            }
        });

        // 3. Hijack Paragraphs following images
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName === 'p' && index !== undefined && index > 0 && parent) {
                // find the previous element sibling
                let prevIndex = index - 1;
                while (prevIndex >= 0 && parent.children[prevIndex].type !== 'element') {
                    prevIndex--;
                }
                
                if (prevIndex >= 0) {
                    const prevNode = parent.children[prevIndex];
                    if (prevNode.properties && prevNode.properties.className && Array.isArray(prevNode.properties.className) && prevNode.properties.className.includes('traces-image-wrapper')) {
                        node.properties = node.properties || {};
                        node.properties.className = [
                            ...(node.properties.className || []),
                            'font-sans', 'text-sm', 'mb-10', 'opacity-70'
                        ];
                    }
                }
            }
        });
    };
}
