/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("ballot")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("electionId", "text", (col) => col.notNull().references("election.id"))
    .addColumn("votingHash", "text", (col) => col.notNull()) // A hash of the voter to prevent an entity from double-voting
    .addColumn("salt", "text", (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable("ballotVote")
    .addColumn("ballotId", "text", (col) => col.notNull().references("ballot.id"))
    .addColumn("candidateId", "text", (col) => col.notNull().references("candidate.id"))
    .addColumn("vote", "text", (col) =>
      col.notNull().check(
        // String is either a valid letter or it contains a positive integer
        sql`vote = 'A' or cast(vote as integer) > 0 and vote = cast(cast(vote as integer) as text)`,
        // TODO: Include valid votes for single-candidate ballots (as a new migration)
      ),
    )
    .addPrimaryKeyConstraint("ballotVote_pk", ["ballotId", "candidateId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  const tables = ["ballotVote", "ballot"];

  for (const table of tables) {
    await db.schema.dropTable(table).execute();
  }
}
