# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a Node.js + TypeScript Express API for an "Acquisitions" service. It uses:
- ESM modules (`"type": "module"` in `package.json`, `NodeNext` in `tsconfig.json`)
- Drizzle ORM with Neon serverless Postgres
- Zod for request validation
- Winston + Morgan for logging
- Cookie-based auth helpers and JWT utilities

The main entrypoint is `src/index.ts`, which loads `src/server.ts`, which in turn boots the Express app defined in `src/app.ts`.

## Common commands

All commands assume the working directory is the repo root.

```bash
# Install dependencies
npm install

# Start dev server with TSX watcher (recompiles on change)
npm run dev

# Type-check and bundle to dist/
npm run build

# Start the compiled server from dist/
npm start

# Lint and auto-fix
npm run lint
npm run lint:fix

# Format and format check
npm run format
npm run format:check

# Drizzle database workflows
# Generate SQL/migrations from `src/models/*.ts`
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Notes for running locally

- The app expects environment variables via `dotenv` (see `drizzle.config.ts` and `src/config/db.ts`). At minimum you need `DATABASE_URL`, and likely `JWT_SECRET`, `JWT_EXPIRES_IN`, and `LOG_LEVEL` for production-like behavior.
- The default HTTP port is `process.env.PORT || 4000` (see `src/server.ts`).
- The root health endpoints:
  - `GET /` – plain-text greeting, logs a message
  - `GET /health` – JSON with status, timestamp, and process uptime
  - `GET /api` – simple API liveness message

## High-level architecture

### Runtime flow

- `src/index.ts`
  - Loads environment variables (`dotenv/config`).
  - Imports `./server.js` (the compiled `.js` counterpart of `src/server.ts`).
- `src/server.ts`
  - Imports the configured Express app from `./app.js`.
  - Reads `PORT` from env (default 4000) and starts `app.listen`.
- `src/app.ts`
  - Creates the Express app instance.
  - Sets up global middleware: `helmet`, `cors`, JSON/body parsers, `cookie-parser`, and HTTP request logging via `morgan` wired into Winston.
  - Declares health and root routes (`/`, `/health`, `/api`).
  - Mounts feature routers, currently `authRouter` at `/api/auth`.

### Domain layout (`src/`)

The `package.json#imports` and `tsconfig` paths expose these internal aliases:
- `#config/*` → `src/config/*`
- `#controllers/*` → `src/controllers/*`
- `#models/*` → `src/models/*`
- `#routes/*` → `src/routes/*`
- `#services/*` → `src/services/*`
- `#utils/*` → `src/utils/*`
- `#validations/*` → `src/validations/*`
- `#middlewares/*` → `src/middlewares/*` (not yet present but reserved)
- `#types/*` → `src/types/*`

There is also a `@/*` alias (from `tsconfig.json`) pointing at `src/*` for more generic imports.

#### Config

- `src/config/db.ts`
  - Initializes a Neon HTTP client using `DATABASE_URL`.
  - Wraps it with Drizzle ORM and exports both `db` (ORM) and `sql` (raw queries).
- `src/config/logger.ts`
  - Central Winston logger configured with JSON output and timestamps by default.
  - Writes to `logs/error.lg` and `logs/combined.log` files.
  - In non-production environments, also logs to the console with colorized, simple formatting.

#### HTTP layer

- `src/routes/auth.routes.ts`
  - Express router for `/api/auth` functionality.
  - `POST /sign-up` → `signup` controller.
  - Placeholder handlers for `POST /sign-in` and `POST /sign-out` currently return static strings.
- `src/controllers/auth.controllers.ts`
  - `signup` controller does:
    - Validates request body with `signupSchema` (Zod).
    - On validation failure, responds `400` with `formValidationError` output.
    - Calls `createUser` service to persist a new user.
    - Generates a JWT containing user id/email/role via `jwttoken.sign`.
    - Sets an auth cookie using `cookies.set`.
    - Logs a success message and returns a `201` response with limited user fields.
    - On duplicate-email scenarios, maps a service error to `409` with an `Email already exists` response.

#### Services and data access

- `src/services/auth.service.ts`
  - `hashPassword(password)`
    - Uses `bcrypt.hash` with salt rounds = 10.
    - Logs and throws a specific error if hashing fails.
  - `createUser(data: CreateUserDTO)`
    - Uses the Drizzle client `db` to:
      - Query `users` by email with `eq(users.email, email)` and `limit(1)`.
      - If a user exists, throws an error (caught and logged in the service, mapped to HTTP in the controller).
      - Otherwise hashes the password and inserts a new user row.
      - Returns a subset of user fields (`id`, `name`, `email`, `role`, `createdAt`).

- `src/models/users.model.ts`
  - Defines the `users` table via `pgTable` with columns: `id`, `name`, `email` (unique), `password`, `role`, `createdAt`, `updatedAt`.

- `drizzle.config.ts`
  - Configures Drizzle to scan `./src/models/*.ts` as the schema and emit files into `./drizzle` for Postgres.

#### Types and validation

- `src/types/index.ts`
  - Drizzle-derived types:
    - `User` – `InferSelectModel<typeof users>`.
    - `NewUser` – `InferInsertModel<typeof users>`.
  - `CreateUserDTO` – shape expected when creating a user from the service/controller layer.

- `src/validations/auth.validation.ts`
  - `signupSchema` – Zod object requiring `name`, `email`, `password`, and `role` (`'user' | 'admin'`, default `'user'`).
  - `signInSchema` – email/password constraints for sign-in.

#### Utilities

- `src/utils/jwt.ts`
  - Centralizes JWT operations through `jwttoken` object:
    - `sign(payload)` – signs payload with `JWT_SECRET` and `JWT_EXPIRES_IN` (defaults provided; override via env in real deployments).
    - `verify(token)` – verifies and decodes a token, throwing a standardized error on failure.
  - All failures are logged via Winston.

- `src/utils/cookies.ts`
  - Exposes `cookies` helper with:
    - `getOptions()` – shared cookie options (HTTP-only, secure in production, strict same-site, 15-minute default expiry).
    - `set(res, name, value, options)` – sets the cookie with merged options.
    - `clear(res, name, options)` – clears a cookie with consistent defaults.
    - `get(req, name)` – reads a named cookie from an Express request.

- `src/utils/format.ts`
  - `formValidationError(errors: ZodError)` – converts Zod errors into a concise string by joining issue messages, with sane fallbacks.

## Linting and style

ESLint is configured via `eslint.config.ts` using `@eslint/js`, `typescript-eslint`, and Prettier integration:
- Targets modern ESM (`sourceType: 'module'`) with Node globals.
- Enforces single quotes, semicolons, `prefer-const`, `no-var`, and object shorthand.
- Treats unused variables that start with `_` as intentionally unused.
- Disables `no-console` (console logging is allowed alongside Winston).
- Ignores typical build and log output directories: `node_modules`, `dist`, `coverage`, `logs`, `drizzle`.

There is no dedicated test setup or test runner config in the repository at this time. If you introduce tests, ensure the `tests/**/*.ts` and `tests/**/*.js` globs (already present in `eslint.config.ts`) remain consistent with the chosen test framework.
