"use client";
import Ballot from "./ballot";
import { useEffect, useRef } from "react";
import { BallotContext } from "@/store/context";
import { createBallotStore, type Entity, type Election } from "@/store/ballot";
import { useStore } from "zustand";
import VotingButton from "./voting-button";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { status } from "@/constants";

type VotingFormProps = {
  election: Election;
  entity: Entity;
};

export default function VotingPage(props: VotingFormProps) {
  const store = useRef(createBallotStore(props)).current;
  const startVoting = useStore(store, (store) => store.startVoting);
  const votes = props.entity.votes ?? 1;
  const hasVoted = useStore(store, (store) => store.entity.votingStatus === status.done);

  // Only register the voting has started on the FE
  useEffect(() => {
    startVoting();
  }, [startVoting]);

  return (
    <BallotContext.Provider value={store}>
      <div className="flex justify-center flex-wrap gap-6 mb-4">
        {Array.from({ length: votes }).map((_, i) => (
          <Ballot key={`ballot${i + 1}`} idx={i} />
        ))}
      </div>
      {!hasVoted && (
        <div className="flex justify-center">
          <VotingButton />
        </div>
      )}
      <Dialog open={hasVoted}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tu voto fue registrado</DialogTitle>
            <DialogDescription>Agradecemos tu participación en esta elección.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </BallotContext.Provider>
  );
}
