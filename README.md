# Tasks

A simple, mobile-friendly task list app. Create tasks with optional notes, mark them complete, and delete them. Data persists in SQLite.

## Run with Docker

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000).

Data is stored in `./data/tasks.db` via a volume mount, so tasks persist across container restarts.

## Run locally

```bash
npm install
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable  | Default              | Description              |
|-----------|----------------------|--------------------------|
| `PORT`    | `3000`               | Server port              |
| `DB_PATH` | `./data/tasks.db`    | Path to SQLite database  |

Copy `.env.example` to `.env` to customize.
