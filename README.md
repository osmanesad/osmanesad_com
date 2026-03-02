# osmanesad.com

Source code for **osmanesad.com** — a minimal personal website focused on writing, coffee, and digital projects.

The site includes:

- Writing system powered by Supabase
- Archive page with search and timeline
- Global like system (no authentication)
- GitHub projects page (auto-fetched via GitHub API)
- Minimal mobile drawer navigation
- Theme + typography controls

---

## Stack

- Vanilla JavaScript (ES modules)
- Supabase (database + RPC)
- GitHub REST API (projects page)
- Static HTML + CSS

---

## Features

### Writing System
Posts are stored in Supabase and rendered dynamically.  
Includes archive view, search, and random post selection.

### Global Like System
Each visitor can like a post once (per browser).  
Like counts are shared globally using:

- `post_likes`
- `post_like_events`
- RPC function for atomic updates

### Projects Page
Fetches public repositories directly from GitHub and lists them
sorted by latest update.

---

## Local Development

You can run the project locally in two ways:

### 1. Python Simple Server
```bash
python3 -m http.server 5500
```
Then open:
```
http://localhost:5500
```

### 2. VS Code – Live Server Extension
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html`
3. Click **"Open with Live Server"**

This is the preferred way for quick testing during development.

---

## Author

Osman Esad  
https://osmanesad.com
