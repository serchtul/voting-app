/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  /**
   * Auto-generated queries using "npx @better-auth/cli generate"
   * {@link https://www.better-auth.com/docs/basic-usage#migrate-database}
   **/
  const generatedQueries = [
    sql`alter table "user" add column "role" text`,
    sql`alter table "user" add column "banned" integer`,
    sql`alter table "user" add column "banReason" text`,
    sql`alter table "user" add column "banExpires" date`,
    sql`alter table "session" add column "impersonatedBy" text`,
  ];

  for (const query of generatedQueries) {
    await query.execute(db);
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const queries = [
    sql`alter table "user" drop column "role"`,
    sql`alter table "user" drop column "banned"`,
    sql`alter table "user" drop column "banReason"`,
    sql`alter table "user" drop column "banExpires"`,
    sql`alter table "session" drop column "impersonatedBy"`,
  ];

  for (const query of queries) {
    await query.execute(db);
  }
}
