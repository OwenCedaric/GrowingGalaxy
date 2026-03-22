# Ceda.is Markdown & MDX Syntax Guide

This project supports **MDX**, which allows you to use standard Markdown syntax along with JSX components and mathematical formulas.

## 🧮 Math & LaTeX Support

We support LaTeX math formulas using `remark-math` and `rehype-katex`.

### Inline Math

Wrap your formula in single `$` signs.

**Syntax:**
```latex
The energy is $E = mc^2$.
```

**Output:**
The energy is $E = mc^2$.

### Block Math

Wrap your formula in double `$$` signs.

**Syntax:**
```latex
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Output:**
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

> **Note:** MDX inside `$$` blocks can be sensitive to curly braces `{}`. If you encounter build errors, ensure your LaTeX syntax is valid.

## 📝 Standard Markdown

### Headers

```markdown
# H1
## H2
### H3
```

### Formatting

- **Bold**: `**text**`
- *Italic*: `*text*`
- ~~Strikethrough~~: `~~text~~`
- `Inline Code`: `` `text` ``

### Lists

**Unordered:**
```markdown
- Item 1
- Item 2
  - Subitem
```

**Ordered:**
```markdown
1. First
2. Second
```

### Links & Images

- **Link**: `[Title](https://example.com)` or `[Title](/relative/path)`
- **Image**: `![Alt Text](/path/to/image.jpg)`

### Blockquotes

```markdown
> This is a quote.
```

## ⚛️ MDX (JSX) Specifics

Since this is MDX, you can use React/JSX components directly.

### HTML/JSX Elements

Standard HTML tags work, but attributes must use **JSX syntax** (camelCase, JavaScript expressions for styles).

**Correct:**
```jsx
<div style={{ backgroundColor: 'red', borderRadius: '5px' }}>
  Content
</div>
```

**Incorrect (standard HTML):**
```html
<!-- This will cause an error -->
<div style="background-color: red; border-radius: 5px;">
  Content
</div>
```

### Self-Closing Tags

All tags must be closed. Void elements like `<img>` and `<br>` **must** be self-closing.

- **Correct**: `<br />`, `<img src="..." />`
- **Incorrect**: `<br>`, `<img src="...">`

### Comments

Use MDX-style comments to prevent them from hitting the final output or causing errors.

```jsx
{/* This is a comment in MDX */}
```

Avoid HTML comments `<!-- ... -->` as they can sometimes cause parsing issues in strict MDX environments.
