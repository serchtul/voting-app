"use client";
import { Vote, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

type VotingButtonProps = {
  disabled: boolean;
  processVotes: () => Promise<void>;
};

export default function VotingButton({ disabled, processVotes }: VotingButtonProps) {
  const [waiting, setWaiting] = useState(false);
  const vote = async () => {
    setWaiting(true);
    await processVotes().catch(() => {
      setWaiting(false);
    }); // TODO: Error handling
  };
  return (
    <Button disabled={disabled || waiting} size="lg" onClick={vote}>
      {waiting ? <LoaderCircle className="animate-spin" /> : <Vote />}
      Votar
    </Button>
  );
}
