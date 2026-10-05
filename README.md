# Chaurpati Digital Information Portal

A source-traceable civic information platform for Chaurpati Rural Municipality.

## Architecture

- `frontend/`: React + Vite client
- `backend/`: NestJS API and isolated official-source adapters
- `backend/prisma/schema.prisma`: SQLite ownership model with provenance and audit fields

The official municipality website is used as an external authoritative source for published municipal information. Imported content is staged for review and is never silently published or used to overwrite manually edited records.

## Run locally

```powershell
cd frontend
npm run dev
```

In another terminal:

```powershell
cd backend
npm run start
```

The API exposes `GET /api/health`, database-backed manual notices at `/api/notices`, and the official-data import workflow at `GET /api/admin/data-import/dashboard`, `GET /api/admin/data-import/latest`, and `POST /api/admin/data-import/fetch`.

## Janata Ko Aawaz setup

The public civic appeal module uses a local SQLite database. It supports public submissions, moderation, signed visitor sessions for votes and submission tracking, comments and replies, reports, approximate map locations, image uploads, and an admin review area at `/admin/appeals`.

SQLite setup creates a new local database and does not copy records from the old PostgreSQL database. Previous PostgreSQL migration files are retained under `backend/prisma/postgresql-migrations-archive` and must not be applied to SQLite.

1. Copy `backend/.env.example` to `backend/.env`. The sample SQLite URL stores data in `backend/dev.db`. Set a private `ADMIN_API_KEY` (at least 24 characters) and a different `VISITOR_TOKEN_SECRET` (at least 32 random characters).
2. From `backend`, run `npx prisma generate`, `npx prisma migrate deploy`, then `npm run build` to create/update the local SQLite database.
3. Run `npm start` from `backend`; Node loads the local `.env` file. Run the frontend with `npm run dev` from `frontend`.
4. Open `/admin/appeals` and enter the configured admin key. The key remains in session storage for that tab.

Citizen images are stored under `backend/uploads/appeals` and served through `/api/uploads/appeals`. Use persistent disk storage or replace this adapter with an object-storage service before deploying to an environment with ephemeral filesystems. Visitor accounts are browser-session identities because this project has no user/account authentication system; clearing browser storage loses the local “My appeals” link and voting identity.

The backend has no configured test or lint scripts. `npm run build` and Prisma validation are available; the frontend provides `npm run lint` and `npm run build`.

## Tourism places

Public tourism browsing is at `/tourism`; published place details use `/tourism/:slug`. The versioned API is under `/api/v1/tourism`. Administration is at `/admin/tourism` and uses the same `ADMIN_API_KEY` as the other admin tools. Editors create drafts, add gallery images and source details, verify a source, and publish a place. Only verified published places appear in public search, homepage highlights, and the Explore Map.

Tourism reuses the shared `MapPlace` and `MapCategory` tables and the existing Explore Map coordinates. Its additive migrations are `backend/prisma/migrations/202610050002_add_tourism_places` and `backend/prisma/migrations/202610050003_add_tourism_review_reports`. Run `npx prisma migrate deploy` before starting the API on a database that has not yet applied them. Generate the shared Prisma client with `npx prisma generate`; the generator writes to `backend/node_modules/.prisma/portal-client`.

Tourism photos are validated JPG, PNG, and WEBP files stored under `backend/uploads/tourism`; keep this directory on persistent storage in production. Visitor ratings, favorites, reviews, and daily deduplicated views use the existing signed browser-session identity because this project has no user account system. Reviews remain pending until approved in `/admin/tourism`; visitor reports appear in its review reports queue. No demo destinations, coordinates, ratings, or views are seeded. A configured street-level imagery provider is not present; the detail page states that street view is unavailable. The directions action opens the shared Explore Map with the destination selected; visitors choose their starting point there.

## Explore Map GIS

The public map is available at `/map` and the authenticated map manager at `/admin/map`. It reads only places marked both verified and published. The map database starts empty because the project did not contain verified facility coordinates or ward boundaries; add real records and source details in the map manager before expecting municipal markers. The map search also looks up geographic names such as Achham through Nominatim when you submit the search; external geographic results are clearly labeled and are not treated as verified municipal places. Requests are cached and throttled, and the provider can be changed with `GEOCODER_URL`.

From `backend`, apply the additive SQLite migration and generate the Prisma client:

```powershell
npx prisma migrate deploy
npx prisma generate
```

In the map manager, create categories, add places with source name/URL and verified coordinates, then publish. Boundary GeoJSON imports support `FeatureCollection`, `Feature`, `Polygon`, and `MultiPolygon`; published boundaries require provenance. Map photos can be uploaded as JPG, PNG, or WEBP and are stored under `backend/uploads/map`.

Copy `frontend/.env.example` to `frontend/.env` to configure map tile templates or a verified starting center. Tile templates are browser-visible provider URLs and must contain `{z}`, `{x}`, and `{y}`. The default street layer uses OpenStreetMap tiles for local development with attribution; configure an appropriate provider for sustained public traffic. Satellite and terrain layers stay unavailable until configured. No street-level imagery provider is configured, so the details panel reports that honestly.

Set `ROUTING_SERVICE_URL` in `backend/.env` to an OSRM-compatible driving route endpoint if you operate or subscribe to a production routing service. Without it, the application uses the public OSRM demo service on a best-effort basis; it supports driving only and does not guarantee availability. Browser geolocation is requested only after the visitor selects “मेरो स्थान”. Public appeal markers use the appeal module's rounded coordinates and never include private contact or author fields.
