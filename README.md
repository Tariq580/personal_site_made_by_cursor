# Terminal Site

A minimal personal website with a terminal-style interface. Write content in Markdown, build to static HTML, deploy to GitHub Pages.

## Quick Start

### 1. Install Node.js

Download and install from [nodejs.org](https://nodejs.org/) (get the LTS version).

### 2. Install Dependencies

```bash
npm install
```

### 3. Write Content

All content lives in `/content/` as Markdown files:

```
/content/
  /writing/          ← Blog articles
    2026-01-08-education.md
    2026-01-07-simplicity.md
  now.md             ← What you're doing now
  work.md            ← Projects and experiments
  life.md            ← Reading, places, favorites
  about.md           ← About you and the site
  links.md           ← Social links and bookmarks
```

### 4. Build the Site

```bash
npm run build
```

This converts your Markdown files to HTML and generates `index.html`.

### 5. Preview Locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 in your browser.

### 6. Deploy

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Pages will automatically serve your updated `index.html`.

---

## Workflow

### Create a new article

```bash
npm run new "My Article Title"
```

This creates `/content/writing/2026-01-22-my-article-title.md` with frontmatter ready to fill in.

### Edit content

Open any `.md` file in `/content/` and edit it. Use your favorite editor (VS Code, Sublime, Obsidian, vim, etc.).

**Example article (`/content/writing/2026-01-22-my-thought.md`):**

```markdown
---
title: My Thought
date: 2026-01-22
---

This is my thought about something...

Multiple paragraphs are fine.

Use standard markdown formatting.
```

### Build and deploy

```bash
npm run build
git add .
git commit -m "New article: My Thought"
git push
```

### Watch mode (auto-rebuild on changes)

```bash
npm run dev
```

This watches `/content/` and auto-rebuilds when you save files.

---

## Content Structure

### Writing Articles

Articles are sorted by date (newest first). Frontmatter:

```markdown
---
title: Article Title
date: 2026-01-22
---

Article content here...
```

### Structured Pages (now, work, life)

These use YAML-structured frontmatter. See existing files for examples.

**Example (`/content/now.md`):**

```markdown
---
title: Now
updated: January 2026
sections:
  - name: working on
    items:
      - name: this site
        desc: Building an interactive terminal-style personal site.
      - name: writing more
        desc: Short notes, longer essays, whatever comes.
---
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the site (markdown → HTML) |
| `npm run dev` | Watch mode (auto-rebuild on save) |
| `npm run new "Title"` | Create a new article |

---

## Stack

- **Content**: Markdown files in `/content/`
- **Build**: Node.js script (`scripts/build.js`)
- **Hosting**: GitHub Pages (free, static)
- **No database, no backend, no CMS**

All content is version-controlled in Git. Easy to backup, easy to migrate.

---

## Customization

- **Colors/Fonts**: Edit `styles.css`
- **Terminal behavior**: Edit `app.js`
- **Build logic**: Edit `scripts/build.js`
- **Content structure**: Edit markdown files in `/content/`

---

## Migration (Future)

Your markdown files are portable. If you ever want to switch to a different platform:

1. **Static site generators**: Hugo, Eleventy, Astro, Next.js all read markdown
2. **CMS**: Netlify CMS, Tina, Forestry can edit these files
3. **Backend**: Import markdown → database with a script
4. **Publishing platforms**: Import to Medium, Substack, Ghost, etc.

Markdown is the universal format. You're future-proof.

---

## License

MIT
