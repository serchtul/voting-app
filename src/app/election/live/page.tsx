import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { Entity } from "@/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LiveElectionPage } from "@/components/pages/live-election";
import { plainify } from "@/lib/plain-ify";

export default async function ElectionTracker() {
  const { error, success } = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permission: { election: ["track"] } },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  if (!success) {
    return (
      <div className="flex justify-center">
        <Alert variant="destructive" className="w-fit">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold">Error</AlertTitle>
          <AlertDescription>No tienes permisos para ver esta página.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // TODO: There's currently only one election in the DB, so this is okay for now
  const dbElection = await db.selectFrom("election").selectAll().executeTakeFirstOrThrow();
  const entities = plainify(
    await db
      .selectFrom("electionVoter")
      .innerJoin("entity", "entityId", "entity.id")
      .select(["entityId as id", "name", "code", "votingStatus", "votes"])
      .where("electionId", "=", dbElection.id)
      .orderBy("name")
      .execute(),
  ) as Entity[];

  return (
    <>
      <div className="flex items-center mb-8 gap-2">
        <Badge variant="destructive">Live</Badge>
        <h1 className="text-3xl">Election Tracker</h1>
      </div>
      <LiveElectionPage electionId={dbElection.id} entities={entities} />
    </>
  );
}
