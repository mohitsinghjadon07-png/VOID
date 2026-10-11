# VOID — Phase 02: Personal Workspace

This is a **patch/update ZIP** for the current VOID Cloud Auth Edition. It adds the signed-in workspace and connects successful login to the new page.

## Files in this ZIP

- `app.js` — replacement for the existing login JavaScript; after successful cloud sign-in, opens `dashboard.html`.
- `dashboard.html` — the new main page.
- `dashboard.css` — the main page's black/purple design and motion.
- `dashboard.js` — session check, project interactions, scroll effects, theme/language preferences, and sign-out.

## Upload through GitHub (no VS Code)

1. Download and extract this ZIP.
2. Open the **same GitHub repository** that hosts the current VOID login page.
3. Choose **Add file → Upload files**.
4. Upload these four website files to the repository root: `app.js`, `dashboard.html`, `dashboard.css`, and `dashboard.js`.
5. Replace the existing `app.js` when GitHub asks. The other three files are new.
6. **Do not replace or remove `supabase-config.js`** — keep the copy you already edited with your own Supabase Project URL and public Publishable/anon key.
7. Leave `index.html`, `styles.css`, `void-effects.js`, and your Supabase setup files as they are.
8. Commit the changes to the branch used by GitHub Pages (usually `main`).
9. Wait for the GitHub Pages deployment to finish, then open the published website and sign in.

## What changed

- A successful sign-in shows the existing short access animation, then opens `dashboard.html` automatically.
- A returning user with an existing cloud session on the login page is sent to the workspace automatically.
- `dashboard.html` checks for a valid Supabase session. If no session exists, it returns to `index.html`.
- Sign-out ends only the local browser session, so it will not intentionally sign the shared account out on teammates' other devices.
- The dashboard includes an animated name reveal, subtle canvas constellation, scroll progress, scroll-triggered reveals, restrained card tilt, responsive layout, language toggle, theme toggle, and links to the known project repositories.

## Project links

Project cards link to public repositories under `mohitsinghjadon07-png`. A GitHub profile link opens the full repository list, including future and less-documented experiments.

## Notes

- Cross-device sign-in requires the Supabase database, `void-login` Edge Function, and `supabase-config.js` to already be configured correctly. This update does not alter your Supabase setup.
- If Supabase isn't configured, the login won't succeed and the workspace will not open.
- The dashboard is protected by a client-side session check. For production apps with private data, enforce authorization on every backend/data endpoint too; a static page alone cannot protect private server-side data.
- The page is designed as a personal portfolio/workspace, not a generic template. Its project descriptions avoid invented impact metrics or awards.
