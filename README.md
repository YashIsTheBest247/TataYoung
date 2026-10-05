# Pravaah

**Live flood navigation for Indian cities, when every minute of water matters.**

A Tata Young Hackathon 2026 submission for the Disaster Resilience track. Pravaah
fuses Sentinel 2 satellite imagery, citizen photos verified by Gemini, and a
routing engine that reshapes a city in seconds. Judges and users get a working
web app on day one: a live Mumbai flood map, Gemini verified reports, a safe
route planner with three vehicle profiles, a vulnerable persons registry, an SOS
flow, and an embedded Gemini chatbot.

## Repository layout

```
TataYoung/
  README.md                    this file
  Pravaah_TataYoungHackathon.docx   full written submission (narrative + screenshots)
  pravaah_architecture.png     Mermaid architecture, rendered
  make_docx.py                 script that rebuilds the DOCX from source + screenshots
  capture_screens.py           Playwright script that captures the 10 product screenshots
  screenshots/                 captured PNGs used in the DOCX
  backend/                     FastAPI service, Python 3.12
    main.py
    requirements.txt
    render.yaml                Render blueprint
    .env.example
  kavach-ai/                   React 19 + Vite + Tailwind frontend
    src/
    vercel.json                Vercel config
    .env.example
    package.json
```

## Running locally

### Backend

```powershell
cd backend
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste a Gemini key from https://aistudio.google.com/apikey
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```powershell
cd kavach-ai
npm install --legacy-peer-deps
cp .env.example .env.local
# .env.local defaults to http://localhost:8000, no edit needed for local
npm run dev
```

Open the printed Vite URL (usually http://localhost:5173 or 5176).

### Capturing fresh screenshots and rebuilding the DOCX

```powershell
pip install playwright python-docx
python -m playwright install chromium
# make sure both servers are running
python capture_screens.py
python make_docx.py
```

## Database (Supabase)

Pravaah stores zones, citizen reports, SOS pins, the vulnerable registry and
the live feed in a Postgres database on Supabase. When `SUPABASE_URL` and
`SUPABASE_KEY` are not set, the backend transparently falls back to an in
memory store that resets on every restart. Set them for anything beyond a
single live demo.

### Setup

1. Create a free Supabase project at https://supabase.com.
2. Open **SQL Editor** in the Supabase dashboard, paste the contents of
   [backend/supabase_schema.sql](backend/supabase_schema.sql) and run it. It
   creates the five tables (`zones`, `reports`, `sos`, `vulnerable`, `alerts`),
   adds indexes, enables RLS, and seeds the eight Mumbai monsoon hotspots.
3. In **Settings > API**, copy two values:
   - **Project URL** (looks like `https://xxxxxx.supabase.co`)
   - **service_role** key (NOT the anon key). This key bypasses RLS and must
     only live on the backend.
4. On Render, set `SUPABASE_URL` and `SUPABASE_KEY` to those values. The
   backend will log `data store: supabase (<url>)` at startup.

## Deployment

### Backend to Render

1. Push this repository to GitHub.
2. In Render, click **New > Blueprint** and point it at the repository. Render
   reads [backend/render.yaml](backend/render.yaml) and provisions one web
   service named `pravaah-api`. The free plan is enough for a hackathon demo.
3. In the service's **Environment** tab, fill in the variables listed under
   "Environment variables" below. The `GEMINI_API_KEY`, `CORS_ORIGINS` and
   `SELF_PING_URL` entries are marked `sync: false` so they must be set
   manually.
4. Once deployed, the service URL looks like `https://pravaah-api.onrender.com`.
   Set `SELF_PING_URL` to `https://pravaah-api.onrender.com/api/health` so the
   dyno never sleeps during a judging window.

### Frontend to Vercel

1. In Vercel, click **Add New > Project** and import the same GitHub repo.
2. In the project settings, set **Root Directory** to `kavach-ai`. Vercel picks
   up [kavach-ai/vercel.json](kavach-ai/vercel.json) for the build command,
   output directory and SPA rewrites.
3. In **Environment Variables**, set `VITE_API_BASE` to the Render backend URL,
   for example `https://pravaah-api.onrender.com`.
4. Deploy. The site appears at something like `https://pravaah.vercel.app`.
5. Add that Vercel URL to the backend `CORS_ORIGINS` variable in Render, then
   redeploy the backend so the browser can call the API.

## Environment variables

### Backend (Render)

| Name                 | Required | Where to get it                                            | Example                                              |
| -------------------- | -------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `GEMINI_API_KEY`     | yes      | https://aistudio.google.com/apikey                         | `AIzaSy...`                                          |
| `GEMINI_MODEL`       | optional | Any valid Gemini model name                                | `gemini-2.0-flash` (default)                         |
| `SUPABASE_URL`       | yes      | Supabase Settings > API > Project URL                      | `https://xxxxxx.supabase.co`                         |
| `SUPABASE_KEY`       | yes      | Supabase Settings > API > service_role key                 | `eyJhbGciOi...` (long JWT)                           |
| `CORS_ORIGINS`       | yes      | The Vercel URL, comma separated for previews               | `https://pravaah.vercel.app`                         |
| `SELF_PING_URL`      | yes      | Your own Render service URL plus `/api/health`             | `https://pravaah-api.onrender.com/api/health`        |
| `SELF_PING_INTERVAL` | optional | Seconds between pings. Default 12.                         | `12`                                                 |
| `PYTHON_VERSION`     | optional | Pin a Python version. Already set in render.yaml.          | `3.12.4`                                             |

If `SUPABASE_URL` or `SUPABASE_KEY` is empty, the backend falls back to an in
memory store that resets on each restart. The service still works but no data
survives a redeploy.

The self ping task runs inside the FastAPI lifespan hook. Every
`SELF_PING_INTERVAL` seconds it hits `SELF_PING_URL` with a small `GET`, which
is enough to keep a Render free dyno hot. Leaving `SELF_PING_URL` empty
disables the loop. Twelve seconds is aggressive on purpose for a demo day; for
long term use, raise the interval to five or ten minutes.

### Frontend (Vercel)

| Name            | Required | Example                                   |
| --------------- | -------- | ----------------------------------------- |
| `VITE_API_BASE` | yes      | `https://pravaah-api.onrender.com`        |

That is the only variable the frontend needs. All other configuration lives in
code.

## Features at a glance

- **Live Mumbai flood map** with eight seeded hotspots, severity shaded zones,
  citizen report pins and SOS markers. Pan, zoom, click a zone for its source.
- **Safe route planner** with three vehicle profiles (pedestrian, car,
  ambulance). Status reads `safe`, `safest available` or `blocked`, with the
  avoided zones listed.
- **Citizen reporting** with photo upload. Gemini vision confirms the photo
  really shows flooding and estimates depth before the zone updates.
- **Family registry** so elderly, bedridden or disabled relatives are visible
  to rescuers the moment water enters their locality.
- **SOS broadcast** that pins a stranded citizen on the live map.
- **Gemini chatbot** on every page, scoped to flood safety, routes, SOS and
  Pravaah usage, with a rules based fallback when the API is throttled.
- **Live feed** that gives control rooms a shared operating picture.

## License

Code in this repository is written for the Tata Young Hackathon 2026
submission. Images from Unsplash are used under the Unsplash license, which
permits free commercial use with attribution encouraged.
