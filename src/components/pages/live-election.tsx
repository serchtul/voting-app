"use client";
import { Entity } from "@/types";
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
import { Progress } from "@/components/ui/progress";
import EntityCard from "../entity-card";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { useEffect, useState } from "react";
import { makePusherClient } from "@/realtime/client";
import { adminEvents, getAdminChannelName } from "@/realtime/constants";
import { produce } from "immer";

type LiveElectionPageProps = {
  electionId: string;
  entities: Entity[];
};

export function LiveElectionPage(props: LiveElectionPageProps) {
  const [entities, setEntities] = useState<Entity[]>(props.entities);
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

  useEffect(() => {
    const pusher = makePusherClient();

    const channel = pusher.subscribe(getAdminChannelName(props.electionId));
    channel.bind(adminEvents.entityVoting, (entityId: string) => {
      setEntities((eys) =>
        produce(eys, (draft) => {
          const ey = draft.find((ey) => ey.id === entityId);
          if (ey) {
            ey.votingStatus = "voting";
          }
        }),
      );
    });
    channel.bind(adminEvents.entityVoted, (entityId: string) => {
      setEntities((eys) =>
        produce(eys, (draft) => {
          const ey = draft.find((ey) => ey.id === entityId);
          if (ey) {
            ey.votingStatus = "done";
          }
        }),
      );
    });

    return () => {
      pusher.disconnect();
    };
  }, [props.electionId]);

  return (
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
  );
}
