# Hack@Davidson — Frontend

This repository contains the Hack@Davidson website (Vite + React + TypeScript + Tailwind).

Quickstart (local):

1. Clone the repository

```bash
git clone git@github.com:MurtazaKafka/hackatdavidson.git
cd davidson-geometry
```

2. Install dependencies and run dev server

```bash
npm install
npm run dev
# opens at http://localhost:8080
```

3. Build for production

```bash
npm run build
npm run preview
```

Notes:

- The project uses Supabase for registrations and storage. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` when running features that contact the backend.
- Deployments are configured for Vercel/Render (see `vercel.json`, `render.yaml`).

If you need deployment help, ask in the project chat or open an issue.