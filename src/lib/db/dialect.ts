import { LibsqlDialect } from "@libsql/kysely-libsql";

const dbUrl = process.env.TURSO_DATABASE_URL;
if (!dbUrl) {
  throw new Error("Missing TURSO_DATABASE_URL environment variable!");
}

export const dialect = new LibsqlDialect({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN ?? "",
});
