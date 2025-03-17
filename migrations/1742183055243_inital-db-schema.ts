/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("entity")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("code", "text", (col) => col.notNull().unique())
    .addColumn("votingEmail", "text", (col) => col.notNull())
    .addColumn("votes", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("votingState", "text", (col) =>
      col
        .notNull()
        .defaultTo("offline")
        .check(sql`votingState in ('offline', 'waiting', 'voting', 'done')`),
    )
    .execute();

  await db.schema
    .createTable("election")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("date", "date", (col) => col.notNull())
    .execute();

  // We don't expect to track candidates across elections, so we choose a 1:N relationship
  await db.schema
    .createTable("candidate")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("electionId", "text", (col) => col.notNull().references("election.id"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("entity").execute();
  await db.schema.dropTable("election").execute();
  await db.schema.dropTable("candidate").execute();
}
