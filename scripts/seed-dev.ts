import { db } from "@/db";
import { assertLocalDatabase } from "./local-db";

assertLocalDatabase();

const electionId = "devElection";

const entities = [1, 2, 3].map((n) => ({
  id: `devEntity${n}`,
  name: `AIESEC Local ${n}`,
  code: `LC${n}`,
  votingEmail: `voter${n}@example.com`,
}));

const ownEmail = process.env.SEED_VOTER_EMAIL;
if (ownEmail) {
  entities.push({ id: "devEntityTest", name: "Test", code: "TEST", votingEmail: ownEmail });
}

const candidates = [1, 2, 3].map((n) => ({
  id: `devCandidate${n}`,
  name: `Candidato ${n}`,
  electionId,
}));

(async () => {
  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("entity")
      .values(entities)
      .onConflict((oc) => oc.doNothing())
      .execute();
    await trx
      .insertInto("election")
      .values({ id: electionId, name: "Elección de prueba", date: new Date().toISOString() })
      .onConflict((oc) => oc.doNothing())
      .execute();
    await trx
      .insertInto("candidate")
      .values(candidates)
      .onConflict((oc) => oc.doNothing())
      .execute();
    await trx
      .insertInto("electionVoter")
      .values(entities.map(({ id }) => ({ electionId, entityId: id })))
      .onConflict((oc) => oc.doNothing())
      .execute();
  });
  console.log(`Seeded election ${electionId} with ${entities.length} entities`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
