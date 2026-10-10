# VOID — Personal Access Portal

A responsive login/sign-up frontend with a purple-and-black visual system, 3D flip animation, English/Hindi labels, dark/light themes, demo credentials, and locally stored demo accounts.

## Run it

This is a static website. You do not need VS Code, Node.js, or any build tools.

### Publish with GitHub Pages
1. Sign in to GitHub and create a new repository (for example, `void-access-portal`).
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository's **root** (the top level, not inside another folder).
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then press **Save**.
6. Wait for GitHub Pages to publish, then open the website URL shown on the Pages screen.

You can upload the files directly through the GitHub website using **Add file → Upload files**.

## Demo sign-in
- **ID:** `DEMO-001`
- **Password:** `Void@2026`

Use the small copy/fill button in the demo-access panel to put these into the login form.

## What works
- The login/sign-up panels flip with a 3D animation.
- Sign-up validates the ID and password fields and creates a demo account in browser local storage.
- The demo account and locally created demo accounts can sign in.
- English/Hindi interface labels and dark/light theme preference are saved in the browser.
- Responsive layout for desktop and mobile, animated abstract artwork, reduced-motion support, and password visibility controls.

## Important security limitation
This is a **frontend prototype only**. GitHub Pages serves static files and does not provide a private authentication server. The demo account is built into the public JavaScript, and accounts created here are stored in the current browser's local storage as a demonstration. Anyone can inspect or bypass client-side checks. Do **not** use real passwords or sensitive information. For genuine authentication, the next version must connect to a backend/authentication provider; the login design can stay the same.

## Customization
- `styles.css`: colors, effects, sizing, animation, theme styles.
- `app.js`: translations, demo login, sign-up behavior, theme/language preferences.
- `index.html`: layout and labels.

The Google Fonts import is optional; if it cannot load, local system fonts are used as fallbacks.
