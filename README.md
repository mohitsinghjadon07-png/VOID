# VOID — Cloud Auth Edition

This package upgrades VOID's browser-only demo login to hosted authentication. GitHub Pages still hosts the front end; Supabase Auth stores accounts centrally, while a Supabase Edge Function lets people sign in with the **VOID ID + password** they choose. The sign-up form also requires an email address for account confirmation and password recovery.

> **Important:** The ZIP is the integrated code, but cloud sign-in will not work until you connect it to your own Supabase project and run the setup steps below. The browser config contains placeholders on purpose. Do not put a Supabase secret/service-role key in a public website.

## Files

### Website files (upload these to the root of your GitHub Pages repository)
- `index.html`
- `styles.css`
- `app.js`
- `void-effects.js`
- `supabase-config.js`

`README.md` is documentation. `supabase-setup/` contains code to paste into Supabase Dashboard; it is not loaded by the website.

## Part A — Create the cloud database and username lookup

1. Create a project at <https://supabase.com/dashboard>.
2. In the project, open **SQL Editor → New query**.
3. Open `supabase-setup/void-auth-schema.sql` from this ZIP, copy all of its text, paste it into the SQL Editor, and click **Run** once.

This creates a private-by-default profile table, a trigger to record the chosen VOID ID, and a lookup function that only the server-side `service_role` can call. The user's email address is never returned to the browser for username sign-in.

## Part B — Deploy the sign-in / recovery function

1. In the Supabase Dashboard, open **Edge Functions**.
2. Choose **Deploy a new function → Via Editor** and create a function named exactly `void-login`.
3. Open `supabase-setup/void-login/index.ts` from this ZIP, copy its entire contents into the editor, replacing the template.
4. In the function deployment settings, turn **Verify JWT** off for this function. The sign-in request comes from a not-yet-authenticated visitor; the function validates the password against Supabase Auth itself. Keep the `service_role` key on the server only.
5. Click **Deploy function**.

The function reads the Supabase-provided environment variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Do not paste the service-role key into `supabase-config.js` or GitHub.

## Part C — Connect the static website

1. In Supabase, open **Project Settings → API Keys** (wording can vary slightly by dashboard version). Copy the **Project URL** and the **Publishable key** (or legacy public `anon` key).
2. Open `supabase-config.js` from this ZIP in a text editor.
3. Replace the two placeholder values with your Project URL and public Publishable/anon key, preserving the quotes. These two values are meant to be visible in a browser; **never** use a `secret` or `service_role` key here.
4. Save the file.

## Part D — Configure confirmation and redirect URLs

1. In Supabase **Authentication → URL Configuration**, set **Site URL** to your exact GitHub Pages site URL, for example `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
2. Add the matching redirect URL to the allowed Redirect URLs list, for example `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/**`. Replace both placeholders with your real GitHub username and repository name.
3. In **Authentication → Sign In / Providers**, ensure the Email provider is enabled. Email confirmation is recommended; new users will need to open the confirmation email before their first login.
4. Supabase's default mail service is for testing and only sends to pre-authorized team addresses. To send confirmation and reset emails to normal visitors, configure a custom SMTP provider in Supabase Auth email settings.

The password-reset link redirects to the GitHub Pages URL and opens VOID's reset-password overlay. The redirect URL must be allowed in Supabase.

## Part E — Publish / replace on GitHub Pages

1. Extract this ZIP.
2. Open your existing VOID repository on GitHub in the browser.
3. Upload the five website files listed under **Website files** to the repository root, replacing the previous versions. `supabase-config.js` is a required new file.
4. Commit changes to the branch used by GitHub Pages. Keep the existing Pages settings.
5. Wait for the commit deployment to finish, refresh the website, and create an account with a unique VOID ID, an email address you can access, and a password of at least 8 characters.

You can do all of this in a web browser; VS Code is not required.

## How to test cross-device login

1. Create an account on the published website and complete email confirmation if enabled.
2. Open the same GitHub Pages URL on another device/browser.
3. Sign in using the VOID ID and password you created. The account is authenticated by Supabase, not looked up in that device's local storage.
4. Try **Forgot?** after entering the account ID to receive a password-reset email.

## Security notes

- Supabase Auth handles password hashing and authentication. VOID does not store account passwords in `localStorage`.
- The public Publishable/anon key is designed for browser use. The service-role key bypasses database policies and must remain inside Supabase's Edge Function environment.
- The username-to-email lookup is server-side and its database function is not executable by `anon` or `authenticated` roles.
- Use a unique password, enable email confirmation, and configure SMTP before allowing other people to register.
- This is still an early-stage personal project. Before a broad public launch, add CAPTCHA / abuse controls, review function logs and database policies, and test the reset flow on the live deployed URL.
