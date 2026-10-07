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

## Official municipal services

The public information hub is at `/services`; individual reference pages use `/services/:slug`. Administration is at `/admin/official-services`. These pages provide bilingual, source-linked government information and official external links. This portal does not accept applications or provide application tracking.

The public API is `GET /api/official-services` (optional `q` search parameter), `GET /api/official-services/:slug`, and `GET /api/documents`. Admin changes use `/api/admin/official-services` and require the configured `ADMIN_API_KEY`. Keep both local servers running while using the page: run `npm start` in `backend` and `npm run dev` in `frontend`; Vite proxies `/api` requests to `http://localhost:3000`. If the API is stopped, those proxied requests fail and the page cannot load service records or documents.

The SQLite migration `202610060001_official_services_hub` creates the `OfficialService` table, seeds Birth and Death Registration reference records, and renames the retired application tables to legacy archive tables instead of deleting them. Apply it with `npx prisma migrate deploy` from `backend`, then run `npx prisma generate` and `npm run build`. Birth and Death Registration are marked `OUTDATED` because the municipality lists their linked forms under fiscal year 2074/75 (2018); confirm current instructions with the municipality before relying on them. Voter Registration and Voter ID link to the Election Commission's voter guidance and registration portal. National ID Enrollment links to DONIDCR's citizen portal and pre-enrollment system and remains `NEEDS_REVIEW` until its local enrollment instructions have been confirmed.

## Budget transparency

The public budget explorer is available at `/budget`. Administration at `/admin/budget` uses the configured `ADMIN_API_KEY`. The backend checks the municipality's [official budget and programme archive](https://www.chaurpatimun.gov.np/budget-program) at startup and every 24 hours; `BUDGET_AUTO_SCAN=false` disables scheduled checks. It discovers recent official red-book PDFs and extracts fiscal year, ward, project, expense code, expenditure head, and amounts. The public page groups planned allocations by ward and sector and links back to the source PDF.

If the backend cannot connect to the archive, an administrator can download its PDF in a browser and upload it at `/admin/budget`. The upload requires the direct PDF URL on the municipality's official website and uses the same parser and publication checks. Only documents identifying Chaurpati with at least ten extracted rows and 50% sector classification are automatically published; other files remain under review. Extraction is heuristic because PDF layouts vary. Figures are planned allocations, not actual or audited spending. Failed imports retain previously published rows.

Migration `202610070002_budget_transparency` adds the budget source and allocation tables. Apply it and regenerate Prisma from `backend` with `npx prisma migrate deploy` and `npx prisma generate`. The scanner requires outbound access to the official municipality site.
