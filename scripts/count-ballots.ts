import { db } from "@/db";
import { isCastBy } from "@/lib/hash-email";

const [email, electionId] = process.argv.slice(2);
if (!email) {
  throw new Error("Usage: npm run votes:count -- <email> [electionId]");
}

(async () => {
  const ballots = await db
    .selectFrom("ballot")
    .select(["salt", "votingHash"])
    .$if(!!electionId, (qb) => qb.where("electionId", "=", electionId))
    .execute();
  console.log(ballots.filter((ballot) => isCastBy(email, ballot)).length);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
