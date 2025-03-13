import EntityCard from "@/components/entity-card";
import { Badge } from "@/components/ui/badge";
import { eys } from "@/app/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const groupedEys = Object.groupBy(eys, ey => ey.votingState === 'offline' ? 'offline' : 'online');
const voted = eys.filter(ey => ey.votingState === 'done').length

const quorum = groupedEys.online!.length;
const progress = voted/quorum*100;

export default function ElectionTracker() {
  return <>
    <div className="flex items-center mb-8 gap-2">
      <Badge variant="destructive">Live</Badge>
      <h1 className="text-3xl">Election Tracker</h1>
    </div>
    <div className="flex gap-6">
      <section className="lg:w-[60vw]">
        <div className="flex flex-wrap items-stretch gap-6 mb-8">
          { groupedEys.online!.map(ey => <EntityCard key={ey.code} {...ey} />)}
        </div>
        <div className="flex flex-wrap items-stretch gap-6 mb-8">
          { groupedEys.offline!.map(ey => <EntityCard key={ey.code} {...ey} />)}
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
            <p>Progreso: {voted}/{quorum} ({progress.toFixed(0)}%)</p>
            <Progress value={progress} />
          </CardContent>
          <CardFooter className="flex justify-end">
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
                        {
                          eys
                            .filter(ey => ey.votingState !== 'done')
                            .map(ey => <li key={ey.code}>{ey.name}</li>)
                        }
                      </ul>
                      <p>Cerrar la votación hará que estas entidades <strong>no puedan votar</strong>.<br /> ¿Deseas continuar?</p>
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
          </CardFooter>
        </Card>
      </section>
    </div>
  </>
}