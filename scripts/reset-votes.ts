import { status } from "@/constants";
import { db } from "@/db";
import { assertLocalDatabase } from "./local-db";

assertLocalDatabase();

(async () => {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("ballotVote").execute();
    await trx.deleteFrom("ballot").execute();
    await trx.updateTable("electionVoter").set("votingStatus", status.offline).execute();
  });
  console.log("Deleted all ballots and reset every voter to offline");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
