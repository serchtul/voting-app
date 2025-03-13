"use client";
import Ballot from "./ballot";
import { Button } from "./ui/button";
import { Vote } from "lucide-react"
import { useEffect, useRef } from "react";
import { BallotContext } from "@/store/context";
import { createBallotStore, type Entity, type Election } from "@/store/ballot";
import { useStore } from "zustand";

type VotingFormProps = {
  election: Election;
  entity: Entity;
}

export default function VotingForm(props: VotingFormProps) {
  const store = useRef(createBallotStore(props)).current;
  const startVoting = useStore(store, store => store.startVoting);
  const votes = props.entity.votes ?? 1;

  // A hack, fix to start voting once we report to the API that we're starting
  useEffect(() => {
    startVoting()
  }, [startVoting]);

  // TODO: Add voting button logic
  return <BallotContext.Provider value={store}>
    <div className="flex justify-center flex-wrap gap-6 mb-4">
        {
          Array.from({ length: votes }).map((_,i) =>
            <Ballot key={`ballot${i+1}`} idx={i} />
          )
        }
    </div>
    <div className="flex justify-center">
      <Button disabled size="lg">
        <Vote />Votar
      </Button>
    </div>
  </BallotContext.Provider>
}
