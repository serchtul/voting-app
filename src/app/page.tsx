import { auth } from "@/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import VotingForm from "@/components/voting-form";
import { db } from "@/db";
import { plainify } from "@/lib/plain-ify";
import type { Election, Entity } from "@/store/ballot";
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

  // TODO: Add error handling when someone who is not assigned to an election logs in.
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

  const election: Election = {
    ...dbElection,
    candidates,
  };

  return (
    <>
      <VotingForm election={election} entity={entity as Entity} />
    </>
  );
}
