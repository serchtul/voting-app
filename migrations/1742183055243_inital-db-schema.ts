/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("entity")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("code", "text", (col) => col.notNull().unique())
    .addColumn("votingEmail", "text", (col) => col.notNull()) // I decided to tie the email to the entity, not the election
    .execute();

  await db.schema
    .createTable("election")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("date", "date", (col) => col.notNull())
    .execute();

  // An M:N relationship between elections and voters (entities)
  await db.schema
    .createTable("electionVoter")
    .addColumn("electionId", "text", (col) => col.notNull().references("election.id"))
    .addColumn("entityId", "text", (col) => col.notNull().references("entity.id"))
    // Number of votes can change depending on the election (i.e.: entities can change membership status)
    .addColumn("votes", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("votingStatus", "text", (col) =>
      col
        .notNull()
        .defaultTo("offline")
        .check(sql`votingStatus in ('offline', 'waiting', 'voting', 'done')`),
    )
    .addPrimaryKeyConstraint("electionVoter_pk", ["electionId", "entityId"])
    .execute();

  // We don't expect to track candidates across elections, so we choose a 1:N relationship for now (instead of N:M)
  await db.schema
    .createTable("candidate")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("electionId", "text", (col) => col.notNull().references("election.id"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in the opposite order of creation, to avoid possible issues with foreign key constraints
  const tables = ["candidate", "electionVoter", "election", "entity"];

  for (const table of tables) {
    await db.schema.dropTable(table).execute();
  }
}
