# Activate your owner dashboard

The dashboard is built but stays locked until you connect Supabase. There is no default password and no browser-only admin bypass.

## 1. Create a dedicated Supabase project

1. Go to https://supabase.com/dashboard and create a new project for this portfolio.
2. In **Authentication → Sign In / Providers**, enable email/password and turn **Allow new users to sign up** off. Labels can vary with dashboard versions.
3. In **Authentication → Users**, use **Add user → Create new user** to create your own account with a strong, unique password. Confirm the email if prompted. Do not put the password in any source file or environment variable.
4. Copy your user's UUID from the Users list.

## 2. Create database and storage rules

1. Open **SQL Editor** and run the entire contetesnts of `supabase/schema.sql` once. Use a fresh project; the script intentionally fails if these objects already exist so it cannot silently replace existing policies.
2. Open `supabase/set-owner.sql`, replace `REPLACE_WITH_YOUR_AUTH_USER_UUID` with your user UUID, and run it in SQL Editor.
3. Do not grant browser clients access to the `private` schema or change the owner table from the browser. The owner can only be changed by someone with project database administration access.

The database permits public reading of the published portfolio. Only the exact Auth account assigned in `private.portfolio_owner` can publish or mutate records. Other signed-in users cannot write. Storage allows only that owner to upload and delete. It also prevents deletion of files referenced by the published document.

## 3. Connect your React app

1. In the project's connection/API settings, copy the **Project URL** and the **publishable key** (or legacy **anon** key).
2. Copy `.env.example` to `.env.local` in `myportfolio`.
3. Replace its placeholder values with those two public settings.
4. Restart `npm start`.

Never use a secret or service-role key with a `REACT_APP_` variable: CRA embeds these values in the public JavaScript bundle. The public key is safe to distribute only because database/storage policies enforce permissions.

## 4. Open the dashboard

- Local: `http://localhost:3000/#/admin` (use the actual port printed by your server).
- Hosted: `https://YOUR_WEBSITE/#/admin`.
- `/admin` also works on hosts configured to rewrite application routes to `index.html`.

The hash URL works on static hosts, including GitHub Pages, without a server rewrite. There is no admin link in the public navigation. The dashboard is loaded separately, has a `noindex` directive, and requires verified owner authentication. Its URL and frontend code are discoverable: secrecy is not the access control. Unauthorized users may reach the sign-in screen but cannot access the editor or change data.

Sign in using the Auth user you created. The initial dashboard loads the current starter content; click **Publish changes** once to save it in your database. Public visitors then receive the published content. Keep account credentials private. For password recovery, manage your Auth user from Supabase rather than adding a public signup form.

## 5. Manage content

- Add/edit/delete/reorder projects, skills, experience, education, certifications, and gallery images.
- Edit your public name, introduction, biography, location, contact information, GitHub URL, and profile images.
- In **CV / Résumé**, upload a PDF to add a download button to the portfolio. Remove the CV link and publish to hide the button.
- **Save to draft** updates the in-memory editor. **Publish changes** writes to Supabase and updates the public portfolio. Drafts are intentionally not saved to localStorage; reloading or signing out discards unpublished changes.
- Uploads are public as soon as they finish, even before the draft is published. Upload only public portfolio images and a public CV; remove personal details you do not want on the internet. SVG, HTML, scripts, and other file types are not accepted. Images are limited to 5 MB in the editor; PDFs to 10 MB.
- Delete unused files from **Upload library**. Removing a card or URL does not remove its file. Publish removal of all references first, then delete the file itself. Deletion is permanent.
- A version check prevents one browser tab from overwriting changes published by another. If a conflict occurs, reload the published version and reapply your changes.
- Sessions are stored in the current browser tab's sessionStorage, and the dashboard signs out after 20 minutes without keyboard/pointer activity. A refresh of the access token does not publish anything.

## 6. Host the website

Add the same two public environment variables to the host **before building**, then run `npm run build` and deploy the `build` directory. CRA reads these values at build time, so rebuild after changing them. Use HTTPS.

For a GitHub Pages project URL such as `https://nazirsamaan.github.io/portfolio/`, set `homepage` to that exact URL in `package.json` before building. Visit `https://nazirsamaan.github.io/portfolio/#/admin`. This project does not automatically configure GitHub Pages or publish a deployment.

## Verify before using real data

1. In a private browser window, load the portfolio and `/#/admin`. The public page should work; the dashboard should show sign-in only.
2. Sign in with your owner account. Add a test project, publish, and confirm it appears in the public page after reload. Edit and delete it, publishing each change.
3. Upload an image and test PDF; check previews, the public CV link, and file deletion after removing references.
4. Using the public key with no user session, attempts to insert/update/delete `portfolio_content`, invoke `save_portfolio`, or upload/delete/list storage objects must fail. Reading published content is intentionally allowed.
5. If you temporarily create a second Auth user through the Supabase dashboard, sign in with it and repeat the mutation checks: they must fail. Remove the test user afterwards. Public signup must remain disabled.
6. Check that a referenced public asset cannot be deleted, and that saving an old version returns no rows instead of overwriting newer data.

These live checks require your configured project; local tests mock Supabase and do not prove that the SQL has been installed.

References: [Row level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Verify a user](https://supabase.com/docs/reference/javascript/auth-getuser).
