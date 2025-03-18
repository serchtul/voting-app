/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  /**
   * Auto-generated queries using "npx @better-auth/cli generate"
   * {@link https://www.better-auth.com/docs/basic-usage#migrate-database}
   **/
  const generatedQueries = [
    sql`create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null)`,
    sql`create table "session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id"))`,
    sql`create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null)`,
    sql`create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date, "updatedAt" date)`,
  ];

  for (const query of generatedQueries) {
    await query.execute(db);
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in the opposite order of creation, to avoid possible issues with foreign key constraints
  const tables = ["verification", "account", "session", "user"];

  for (const table of tables) {
    await db.schema.dropTable(table).execute();
  }
}
