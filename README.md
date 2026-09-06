# The Capital Lens — Publishable CMS Website

This version is designed to be the **real website source**, not a one-off local HTML preview.

## What changed

The original site stored the first post inside JavaScript. This version uses a proper content system:

- `content/posts/` — every weekly analysis is its own JSON content file.
- `content/site.json` — branding, homepage intro, About copy, and disclaimer.
- `admin/` — Decap CMS publishing dashboard.
- `build.js` — builds the homepage, archive, About page, and every article page.
- `assets/` — design, logo, and uploaded images.
- `netlify.toml` — tells Netlify how to build and publish the site.
- `_site/` — generated website output. Netlify creates this automatically.

No npm packages are required by the build script. It uses Node's built-in modules only.

## Your normal Saturday workflow

After the one-time setup below, weekly publishing is simple:

1. Visit `https://YOUR-DOMAIN/admin/`.
2. Sign in with GitHub.
3. Open **Market Analysis** and choose **New Market Analysis**.
4. Fill in your title, publish date, short summary, market snapshot, quick take, report sections, and sources.
5. Click **Publish**.
6. Decap CMS commits the new content file to GitHub.
7. Netlify detects the commit, runs `npm run build`, and publishes the new build.
8. The newest report automatically moves to the top of `/analysis/` and becomes the homepage feature if **Feature on Homepage** is enabled.

The old live deployment remains available while the new build is created, so you do not manually take the site offline to add a post.

---

# One-time setup

## 1. Create the GitHub repository

Create a GitHub repository named:

`the-capital-lens`

Upload the contents of this folder to the repository root. The repository should contain files such as:

- `build.js`
- `package.json`
- `netlify.toml`
- `admin/config.yml`
- `content/site.json`
- `content/posts/...`

Do **not** worry about uploading `_site/`; it is ignored by Git and rebuilt by Netlify.

## 2. Put your repository name into Decap CMS

Open:

`admin/config.yml`

Change:

```yaml
repo: YOUR_GITHUB_USERNAME/the-capital-lens
```

to your actual GitHub username and repository, for example:

```yaml
repo: exampleuser/the-capital-lens
```

Commit that change to GitHub.

## 3. Deploy the repository on Netlify

In Netlify:

1. Choose **Add new project** → **Import an existing project**.
2. Choose GitHub and authorize Netlify.
3. Select your `the-capital-lens` repository.
4. Netlify should read `netlify.toml` automatically.
5. The build command is `npm run build`.
6. The publish directory is `_site`.
7. Publish the site.

Netlify will give you an address similar to:

`https://your-site-name.netlify.app`

## 4. Put your Netlify URL into the CMS config

Open `admin/config.yml` again and replace both placeholder lines:

```yaml
site_url: https://YOUR-NETLIFY-SITE.netlify.app
display_url: https://YOUR-NETLIFY-SITE.netlify.app
```

with your actual Netlify URL. Commit the change.

## 5. Set up GitHub login for Decap CMS

This project uses Decap CMS's direct **GitHub backend** rather than the older Git Gateway setup.

### In GitHub

1. Open **Settings** → **Developer settings** → **OAuth Apps**.
2. Register a new OAuth application.
3. Use your Netlify site as the Homepage URL.
4. Set the Authorization callback URL to:

`https://api.netlify.com/auth/done`

5. Copy the **Client ID**.
6. Generate a **Client Secret** and copy it somewhere safe.

### In Netlify

1. Open your project.
2. Go to **Project configuration** → **Access & security** → **OAuth**.
3. Under **Authentication Providers**, install GitHub.
4. Paste the GitHub Client ID and Client Secret.
5. Save.

Then visit:

`https://YOUR-SITE.netlify.app/admin/`

Choose GitHub login. The GitHub account must have write access to the repository.

## 6. Publish your first new post

Your September 5, 2026 analysis is already stored in:

`content/posts/2026-09-05-strong-jobs-higher-yields.json`

Once `/admin/` is working, it will appear inside the CMS. You can edit it there or create a new one.

---

# How automatic ordering works

`build.js` reads all `.json` files from `content/posts/` and sorts them by the `date` field from newest to oldest.

You never manually reorder the Analysis page.

Every report receives its own permanent URL:

`/analysis/YYYY-MM-DD-post-name/`

The archive stays intact when a new post is added.

# Editing the website itself

You can edit your brand and About copy in `/admin/` under **Site Settings → Branding & About**.

For design changes, edit:

`assets/styles.css`

Publishing new analysis posts does not require editing that file.

# Custom domain later

Once the Netlify site is working, you can connect a domain from **Domain management → Production domains**. You can keep using the same CMS and GitHub setup after the domain is connected.

# Local build test

If Node.js is installed, run:

```bash
npm run build
```

That generates the finished website in `_site/`.

For local browsing, use a local web server rather than double-clicking `_site/index.html`, because the production site uses root-relative URLs such as `/assets/styles.css`.
