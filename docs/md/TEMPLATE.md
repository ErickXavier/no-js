# Page Title

One-paragraph introduction explaining **what** this feature does and **why** you would use it. Lead with the problem being solved, then introduce the solution.

> **Tip:** Use admonitions sparingly for important asides. Available types: **Note** (supplementary info), **Tip** (best practice), **Warning** (footgun or data-loss risk).

---

## Basic Usage

Start with the simplest possible working example. The reader should be able to copy-paste this and see it work.

```html
<div state="{ count: 0 }">
  <span bind="count"></span>
  <button on:click="count++">Add</button>
</div>
```

---

## Feature Section

Organize content from simple to complex. Each H2 section covers one concept or sub-feature.

### Subsection

Use H3 for subdivisions within a section. Never skip heading levels (H2 → H4).

```html
<!-- Show progressively complex examples -->
<!-- Use HTML comments for omitted code, never ellipsis -->
<div>...</div>
```

---

## Attributes

Every directive page must include a complete attribute reference table with consistent columns.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `directive` | `string` | — | Main directive expression |
| `option` | `string` | `"default"` | Optional configuration |
| `flag` | `boolean` | `false` | Toggle behavior on/off |

---

## Common Mistakes

Highlight pitfalls the reader is likely to hit. Use before/after code pairs.

```html
<!-- WRONG -->
<div directive="value">

<!-- RIGHT -->
<div directive="value" required-attr="data">
```

---

## See Also

- [Related Feature](related.md) — one-line description of the relationship
- [Another Feature](another.md) — when to use that instead of this

---

**Previous:** [Prev Page →](prev.md) | **Next:** [Next Page →](next.md)

<!--
TEMPLATE GUIDELINES (delete this comment block when using)

Structure rules:
  - One H1 per page (the page title)
  - H2 for major sections, H3 for subsections, never skip levels
  - Blank line before and after headings, code blocks, lists, blockquotes
  - Horizontal rules (---) between major sections

Content rules:
  - Second person, active voice, present tense ("You create..." not "A route is created...")
  - Lead with WHY, then show HOW
  - Every code example must be copy-pasteable and runnable
  - Show the simplest example first, then build complexity
  - Use HTML comments for omitted code, never "..." or ellipsis
  - Consistent terminology: "directive" (not "attribute" when referring to NoJS features)

Required sections (in order):
  1. H1 title + intro paragraph (always)
  2. Basic Usage (always — simplest working example)
  3. Feature sections (as needed — simple to complex)
  4. Attributes table (for directive pages — Type/Default/Description columns)
  5. Common Mistakes (when applicable — before/after pairs)
  6. See Also (always — at least one cross-reference)
  7. Previous/Next navigation (always)

Admonitions (use sparingly):
  > **Note:** Supplementary information
  > **Tip:** Best practice or shortcut
  > **Warning:** Potential footgun or data-loss risk

Cross-references:
  - Always use relative paths: [Link Text](other-page.md)
  - When mentioning a concept documented elsewhere, link to it
  - Never use "click here" — use descriptive link text

Code blocks:
  - Always specify language: ```html, ```css, ```javascript
  - Wrap lines at ~80 characters
  - Include enough context to be runnable (state, parent elements)
-->
