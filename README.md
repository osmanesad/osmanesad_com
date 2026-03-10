# osmanesad.com

Personal website source for `osmanesad.com`.

The site is a static front-end that pulls:

- writings from Supabase
- public repositories from the GitHub API
- static profile content from local HTML files

## Pages

- `index.html`: landing page and writing reader
- `archive.html`: writing archive with search and year navigation
- `projects.html`: public GitHub repositories
- `about.html`: profile, contact, and CV links

## Stack

- HTML
- CSS
- Vanilla JavaScript with ES modules
- Supabase
- GitHub REST API

## Project structure

```text
.
|-- about.html
|-- archive.html
|-- archive.js
|-- app.js
|-- assets/
|   |-- icons/
|   `-- *.pdf
|-- index.html
|-- posts/
|-- posts.json
|-- projects.html
|-- projects.js
|-- styles.css
`-- version.txt
```

## Local preview

Use any static server. Two simple options:

### Python

```bash
python -m http.server 5500
```

### VS Code Live Server

Open `index.html` with the Live Server extension.

Then visit:

```text
http://localhost:5500
```

## Data dependencies

### Supabase

The writing system expects a `posts` table with published rows that include:

- `id`
- `title`
- `date`
- `content_html`
- `status`

Older like-related structures may still exist in Supabase, but the homepage and archive now focus on reading and navigation.

### GitHub

`projects.js` reads public repositories from:

```text
https://api.github.com/users/osmanesad/repos
```

No build step is required.

## Editing notes

- Shared visual language lives mostly in `styles.css`
- Landing and reader behavior live in `app.js`
- Archive behavior lives in `archive.js`
- Projects behavior lives in `projects.js`
- The site uses a soft gray / muted accent palette and shared navigation across all main pages
- Reader font-size controls exist only in the writing reader area on `index.html#post-id`

## Quick maintenance checklist

1. Check `version.txt` when shipping a visible update.
2. Verify Supabase content loads on `index.html` and `archive.html`.
3. Verify GitHub API output on `projects.html`.
4. Confirm navigation between `index.html`, `about.html`, `archive.html`, and `projects.html`.
5. Check mobile layout around `390px` width on all main pages.
6. Check reader mode by opening a page like `index.html#post-id`.
7. Confirm reader font-size controls still work in the article view.

## Author

Osman Esad  
https://osmanesad.com
