import { auth } from "@/auth";
import VotingForm from "@/components/voting-form";
import { db } from "@/db";
import { plainify } from "@/lib/plain-ify";
import type { Election, Entity } from "@/store/ballot";
import { headers } from "next/headers";

export default async function Home() {
  const {
    user: { email },
  } = (await auth.api.getSession({
    headers: await headers(),
  }))!;

  // TODO: There's currently only one election in the DB, so this is okay for now
  const dbElection = await db.selectFrom("election").selectAll().executeTakeFirstOrThrow();
  const candidates = plainify(
    await db
      .selectFrom("candidate")
      .select(["id", "name"])
      .where("electionId", "=", dbElection.id)
      .execute(),
  );

  // TODO: Add error handling when someone who is not assigned to an election logs in.
  const entity = plainify(
    await db
      .selectFrom("entity")
      .innerJoin("electionVoter", "entity.id", "entityId")
      .select(["id", "name", "code", "votingStatus", "votes"])
      .where("votingEmail", "=", email)
      .executeTakeFirstOrThrow(),
  ) as Entity;

  const election: Election = {
    ...dbElection,
    candidates,
  };

  // TODO: Add different branches for when an entity has is done voting (maybe a redirect?)
  return (
    <>
      <h1>Votaciones</h1>
      <VotingForm election={election} entity={entity} />
    </>
  );
}
