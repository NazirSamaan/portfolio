# Nazir's Portfolio

A responsive React portfolio inspired by the supplied dark navy and cyan design.

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

## Check interactions

`node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand`

## Owner dashboard

Open `/#/admin` directly. It has no public navigation link. Supabase configuration, account creation, owner database policies, upload rules, and hosting instructions are in [ADMIN_SETUP.md](ADMIN_SETUP.md). Until configured, the dashboard stays locked. Live authorization policies must be verified against your project before use.

## Online hosting

GitHub Pages: https://nazirsamaan.github.io/portfolio/

Owner login: https://nazirsamaan.github.io/portfolio/#/admin

Pushing to `main` runs `.github/workflows/pages.yml`, which tests, builds, and deploys. Public service settings are stored in the repository Actions variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and `REACT_APP_FORMSPREE_ENDPOINT`). Never use a service-role key. `.env.local` stays local and is not pushed.
