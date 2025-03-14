import type { Entity, Status } from "@/store/ballot";
import { Card, CardContent } from "./ui/card";
import { CheckCircle, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusMessages: Record<Status, string> = {
  offline: "Desconectado",
  voting: "Votando",
  done: "Votó",
};

export default function EntityCard({ name, votingState: status, code }: Entity) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="flex w-20 lg:w-25 aspect-5/3 justify-center items-center">
            <CardContent
              className={cn("flex items-center gap-1", status === "offline" && "text-zinc-500")}
            >
              {status === "offline" && <WifiOff />}
              {status === "done" && <CheckCircle className="text-green-500" />}
              {code}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {name} - {statusMessages[status]}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
