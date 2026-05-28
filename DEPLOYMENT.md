# Deploying SwiftShip on Vercel

This project is configured for Vercel as a static frontend app.

## Vercel Settings

- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty
- Root Directory: repository root

The root `vercel.json` rewrites public URLs to files inside `frontend/`, so `frontend/index.html`, `frontend/style.css`, `frontend/script.js`, and `frontend/state.json` are served from the site root.

## Deploy Through GitHub

1. Push this repository to GitHub.
2. Open Vercel and import the GitHub repository.
3. Keep the settings above.
4. Deploy.
