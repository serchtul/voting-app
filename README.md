# AIESEC in Mexico Elections

A web app for running AIESEC in Mexico's elections. Each entity (local committee) signs in with
Google, fills in one ballot per vote it holds and submits them anonymously. Admins and observers
follow each entity's voting status live.

Built with [Next.js](https://nextjs.org) 16 (App Router), [Better Auth](https://www.better-auth.com)
with Google sign-in, [Kysely](https://kysely.dev) over [libSQL / Turso](https://turso.tech) and
[Pusher](https://pusher.com) for the live updates.

## How it works

- **Voting:** a user whose email matches an entity's `votingEmail` sees that entity's ballots on
  `/`. With several candidates, each ballot ranks them (`1`, `2`, …) or abstains (`A`). With a
  single candidate, it's a vote for or against. Ballots don't reference the entity: each one
  stores a SHA-256 hash of the voter's email plus a random salt. That keeps them from being linked
  to an entity at a glance while still letting the app stop an entity from casting more ballots
  than it holds. Anyone with database access who knows an entity's email can still find its
  ballots (that's what `npm run votes:count` does), so access to the database should stay limited.
- **Live tracking:** `/election/live` shows every entity's status (`offline`, `voting`, `done`) as
  it changes. Only users with the `election:track` permission can open it: the `observer`, `admin`
  and `superadmin` roles.
- **Auth:** `src/proxy.ts` redirects signed-out users to `/login`. Roles and permissions are
  defined in `src/auth/policies.ts`.

## Requirements

- Node.js 22.12 or later (see `.nvmrc`).
- A libSQL server. Locally, `docker compose` (or `podman compose`) runs one from
  `docker-compose.yml`.
- A Google OAuth client and a Pusher Channels app.

## Local setup

1. Install the dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` and fill it in:

   | Variable                                                                                | Value                                                                                                     |
   | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
   | `TURSO_DATABASE_URL`                                                                    | `http://127.0.0.1:8080` for the local server, or a Turso URL                                              |
   | `TURSO_AUTH_TOKEN`                                                                      | Required for Turso, optional locally                                                                      |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                              | A Google OAuth client with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI |
   | `BETTER_AUTH_SECRET`                                                                    | A random string of 32+ characters, e.g. `openssl rand -base64 32`                                         |
   | `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_REGION` | From the Pusher app's keys. The region is the cluster, e.g. `us2`                                         |
   | `SEED_VOTER_EMAIL`                                                                      | Optional. Adds a "Test" entity for your own Google account when seeding                                   |

3. Start the database and apply the migrations:

   ```bash
   docker compose up -d
   npx kysely migrate:latest
   ```

   The data lives in `.data/libsql`, which is gitignored.

4. Optionally, seed a test election with three entities and three candidates:

   ```bash
   npm run db:seed
   ```

5. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Scripts

| Command                                       | What it does                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`                                 | Starts the dev server                                                                              |
| `npm run build` / `npm start`                 | Builds and serves the production app                                                               |
| `npm run lint`                                | Runs ESLint (with Prettier)                                                                        |
| `npx kysely migrate:latest`                   | Applies the migrations in `migrations/`                                                            |
| `npm run db:codegen`                          | Regenerates the database types in `src/db/db.d.ts` from the current schema                         |
| `npm run db:seed`                             | Seeds a test election. Local databases only                                                        |
| `npm run votes:reset`                         | Deletes every ballot and sets all entities back to `offline`. Local databases only                 |
| `npm run votes:count -- <email> [electionId]` | Counts the ballots cast by an email                                                                |
| `npm run user:create`                         | Creates Google-only users through the admin API. Edit the list and admin token in the script first |

The scripts read `.env`. `db:seed` and `votes:reset` refuse to run unless `TURSO_DATABASE_URL`
points to a local database.

## Setting up an election

There's no admin UI yet, so an election is set up directly in the database:

1. Insert the election into `election`, its candidates into `candidate`, and each voting entity
   into `entity`, with the email it will sign in with as `votingEmail`.
2. Link each entity to the election in `electionVoter`, with `votes` set to the number of ballots
   it can cast.
3. Give observers and admins their role by setting `role` on their row in `user` (`observer`,
   `admin` or `superadmin`). Users appear there after their first sign-in, or after
   `npm run user:create`.

The app currently assumes a single election in the database.
