import EntityCard from "@/components/entity-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { Entity } from "@/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const entities = (await db
    .selectFrom("electionVoter")
    .innerJoin("entity", "entityId", "entity.id")
    .select(["entityId as id", "name", "code", "votingStatus", "votes"])
    .where("electionId", "=", dbElection.id)
    .orderBy("name")
    .execute()) as Entity[];

  const groupedEys = Object.groupBy(entities, (ey) =>
    ey.votingStatus === "offline" ? "offline" : "online",
  );
  const onlineEys = groupedEys.online ?? [];
  const offlineEys = groupedEys.offline ?? [];

  const quorum = entities.reduce((sum, ey) => sum + ey.votes, 0);
  const voted = entities
    .filter((ey) => ey.votingStatus === "done")
    .reduce((sum, ey) => sum + ey.votes, 0);
  const progress = Math.trunc((voted / quorum) * 100);

  return (
    <>
      <div className="flex items-center mb-8 gap-2">
        <Badge variant="destructive">Live</Badge>
        <h1 className="text-3xl">Election Tracker</h1>
      </div>
      <div className="flex gap-6">
        <section className="lg:w-[60vw]">
          <div className="flex flex-wrap items-stretch gap-6 mb-8">
            {onlineEys.map((ey) => (
              <EntityCard key={ey.code} {...ey} />
            ))}
          </div>
          <div className="flex flex-wrap items-stretch gap-6 mb-8">
            {offlineEys.map((ey) => (
              <EntityCard key={ey.code} {...ey} />
            ))}
          </div>
        </section>
        <section className="lg:w-[20vw]">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                <p>Quórum: {quorum} votos</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Progreso: {voted}/{quorum} ({progress.toFixed(0)}%)
              </p>
              <Progress value={progress} />
            </CardContent>
            <CardFooter className="flex justify-end">
              {progress < 100 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild className="">
                    <Button variant="destructive">Cerrar Votación</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Realmente quieres cerrar la votación?</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div>
                          <p className="mb-2">Las siguientes entidades no han votado:</p>
                          <ul className="list-disc pl-6 my-3">
                            {entities
                              .filter((ey) => ey.votingStatus !== "done")
                              .map((ey) => (
                                <li key={ey.code}>{ey.name}</li>
                              ))}
                          </ul>
                          <p>
                            Cerrar la votación hará que estas entidades&#20;
                            <strong>no&nbsp;puedan&nbsp;votar</strong>.<br /> ¿Deseas continuar?
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button variant="destructive">Continuar</Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </section>
      </div>
    </>
  );
}
