# Nazir's Portfolio

A responsive React portfolio with a cream and lime editorial layout, project details, and an archive of original coursework.

## Run locally

- `npm install`
- `npm start`
- `npm run build` for a production bundle

## Customize

- Manage content through the owner dashboard after following [ADMIN_SETUP.md](ADMIN_SETUP.md). The initial starter data lives in `src/portfolioData.js`.
- The five project cards are illustrative concepts. Replace their descriptions, screenshots, and links with your own work.
- Replace the general education and milestones sections with your verified qualifications.
- The hero loads your GitHub avatar. Replace its image URL with a local portrait if preferred.
- The contact form submits directly through Formspree once you verify the receiving Gmail inbox and configure its endpoint. Follow [EMAIL_SETUP.md](EMAIL_SETUP.md). The site checks address formatting, not visitor mailbox ownership.
- Fonts load from Google Fonts; photography loads from Unsplash.

## Included interactions

Skill and project filtering, project detail dialogs, mobile navigation, section highlighting, a light/dark theme toggle, and a direct-submit contact form.

## Portfolio archive

The gallery is declared in `src/portfolioArchive.json`. Its preview images and downloadable originals live in `public/portfolio/`. Related website and C# source files are grouped into ZIP downloads. The original `Portfolio/` folder stays local and is ignored by Git.

To rebuild the catalogue from that original folder, run `python scripts/import-portfolio.py`. Keep the existing website screenshots in `public/portfolio/previews/`.

The college website ZIP contains about 1 GB of original videos and stays out of Git and the website build. Its preview remains visible. Until an external download is published, the card offers the full archive on request. After approval to publish the complete archive, `scripts/publish-portfolio-download.py` uploads it to GitHub Releases using the existing Git credential and updates the catalogue URL. It never writes credentials to disk.

## Check interactions

`node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand`

## Owner dashboard

Open `/#/admin` directly. It has no public navigation link. Supabase configuration, account creation, owner database policies, upload rules, and hosting instructions are in [ADMIN_SETUP.md](ADMIN_SETUP.md). Until configured, the dashboard stays locked. Live authorization policies must be verified against your project before use.

## Online hosting

GitHub Pages: https://nazirsamaan.github.io/portfolio/

Owner login: https://nazirsamaan.github.io/portfolio/#/admin

Pushing to `main` runs `.github/workflows/pages.yml`, which tests, builds, and deploys. Public service settings are stored in the repository Actions variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and `REACT_APP_FORMSPREE_ENDPOINT`). Never use a service-role key. `.env.local` stays local and is not pushed.
