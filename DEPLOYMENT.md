# Deploying SwiftShip on Vercel

This project is configured for Vercel with:

- a static frontend in `frontend/`
- a Python serverless API in `api/`

## Vercel Settings

- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty
- Root Directory: repository root

The root `vercel.json` keeps `/api/*` mapped to Vercel Functions and rewrites public frontend URLs to files inside `frontend/`.

## Backend API

The backend simulation is exposed as:

- `GET /api/simulation`

Vercel deploys `api/simulation.py` as a Python serverless function. It imports the existing scheduling, sorting, model, and data generator modules from `backend/`.

The frontend calls `/api/simulation` on startup. If the API is unavailable during simple local static testing, it falls back to browser-generated simulation data.

## Deploy Through GitHub

1. Push this repository to GitHub.
2. Open Vercel and import the GitHub repository.
3. Keep the settings above.
4. Deploy.
