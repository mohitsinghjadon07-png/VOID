# VOID — Circle / Ascension Edition

VOID is a responsive, purple-and-black personal access portal with a circular 3D-flip login and sign-up interface. It is a static website designed to be uploaded directly to GitHub Pages. No VS Code, Node.js, build system, or server is required to publish the frontend.

## Publish or replace the old version on GitHub Pages

1. Download and extract this ZIP on your computer.
2. Open your existing GitHub repository for VOID.
3. Choose **Add file → Upload files**.
4. Upload **all five files** from this folder to the repository's root: `index.html`, `styles.css`, `app.js`, `void-effects.js`, and `README.md`. Replace files when GitHub asks.
5. Scroll down and commit the changes to your `main` branch.
6. Keep your current GitHub Pages settings as they are. Pages will rebuild the site after the commit.

You can do the whole process in your web browser; VS Code is not needed.

## Demo credentials

- **User ID:** `DEMO-001`
- **Password:** `Void@2026`

Use the demo-access copy/fill control on the login screen to populate the fields.

## Included features

- Circular sign-in/sign-up face with 3D flip animation and animated purple edge light.
- Ambient purple cursor glow and a gently animated blockchain-style constellation field.
- Floating blockchain-inspired nodes that react visually when the cursor approaches.
- Animated access-verification ring and a personalized identity card after successful demo login.
- Sign-up validation, live password-strength meter, password visibility toggles, and helpful inline messages.
- English/Hindi labels and dark/light themes, with browser-local preferences.
- A settings panel for animation intensity, optional interface sounds, and reduced motion.
- Responsive layout, keyboard Escape handling, focus indicators, and respect for the operating system's reduced-motion preference.
- Optional UI tones use the browser's Web Audio API. Sounds are off by default and require a user gesture to enable.

## Files

- `index.html` — structure and interface labels.
- `styles.css` — layout, colors, motion, and responsive styling.
- `app.js` — language/theme/settings behavior and demonstration sign-in/sign-up logic.
- `void-effects.js` — animated network canvas, cursor glow, and nearby-node effects.

## Important security limitation

This remains a **frontend-only demo**. GitHub Pages serves static files and does not run private backend code. The demo credentials are visible in the public JavaScript, and accounts created with sign-up are saved in the current browser's local storage; these demo passwords are not protected as production credentials. The sign-in animation and identity card demonstrate the interface only. Do not use real passwords, private data, or this as a secure account system. For real accounts, connect the interface to a proper authentication provider or backend before relying on it.

## Notes

The page uses Google Fonts if internet access is available and falls back to local system fonts if not. All other effects are built with regular HTML, CSS, and JavaScript and do not require paid APIs.
