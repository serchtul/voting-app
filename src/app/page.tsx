import { auth } from "@/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import VotingPage from "@/components/voting-page";
import { status } from "@/constants";
import { db } from "@/db";
import { hashEmailQuery } from "@/lib/hash-email";
import { plainify } from "@/lib/plain-ify";
import type { Ballot, Election, Entity, Vote } from "@/types";
import { AlertCircle } from "lucide-react";
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

  const entity = plainify(
    await db
      .selectFrom("entity")
      .innerJoin("electionVoter", "entity.id", "entityId")
      .select(["id", "name", "code", "votingStatus", "votes"])
      .where("votingEmail", "=", email)
      .executeTakeFirst(),
  );

  if (!entity) {
    return (
      <div className="flex justify-center">
        <Alert variant="destructive" className="w-fit">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold">Error</AlertTitle>
          <AlertDescription>
            Tu usuario no está asignado a ninguna elección, intenta nuevamente.
            <br /> Si el problema persiste, contacta al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  let ballots: Ballot[] | undefined;
  if (entity.votingStatus === status.done) {
    const rawVotes = await db
      .selectFrom("ballot")
      .innerJoin("ballotVote", "ballotId", "ballot.id")
      .select(["ballotId", "candidateId", "vote as value"])
      .where("electionId", "=", dbElection.id)
      .whereRef("votingHash", "=", hashEmailQuery(email))
      .execute();

    // Technically, this should always be true
    if (rawVotes.length > 0) {
      const candidateIdx = new Map(candidates.map(({ id }, idx) => [id, idx]));
      const rawBallots = Object.groupBy(rawVotes, (vote) => vote.ballotId);
      ballots = Object.values(rawBallots).map((ballot) =>
        // Ensure the order of the votes in the ballots matches that of the candidates
        ballot!
          .map<Vote>((v) => ({ candidateId: v.candidateId, value: v.value }))
          .sort((a, b) => candidateIdx.get(a.candidateId)! - candidateIdx.get!(b.candidateId)!),
      );
    }
  }

  const election: Election = {
    ...dbElection,
    candidates,
  };
  return <VotingPage election={election} entity={entity as Entity} ballots={ballots} />;
}
