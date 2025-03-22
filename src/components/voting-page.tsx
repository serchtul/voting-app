"use client";
import { useEffect, useState } from "react";
import { produce } from "immer";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ABSTENTION, status } from "@/constants";
import Ballot from "./ballot";
import { processVotes, startVoting } from "@/actions";
import { type Election, type Entity, type Ballot as BallotType, type Vote } from "@/types";
import { assertEntityIsVoting } from "@/lib/entity-is-voting";
import { voteSchema } from "@/lib/validate/vote";
import VotingButton from "./voting-button";

type VotingFormProps = {
  election: Election;
  entity: Entity;
};

export default function VotingPage({ entity, election }: VotingFormProps) {
  const votes = entity.votes ?? 1;
  const hasVoted = entity.votingStatus === status.done;
  const [ballots, setBallots] = useState<BallotType[]>(
    Array.from({ length: votes }, () =>
      election.candidates.map(({ id }) => ({ candidateId: id }) as Vote),
    ),
  );
  const { success: votesAreValid } = voteSchema.safeParse(ballots);

  // Only register the voting has started when we are on the FE
  useEffect(() => {
    if (entity.votingStatus === status.offline) {
      startVoting(election.id, entity.id); // TODO: Error handling
    }
  }, [election.id, entity]);

  const updateBallot = (ballotIdx: number) => (candidateId: string, value?: string) => {
    assertEntityIsVoting(entity);
    setBallots(
      produce(ballots, (draft) => {
        for (const vote of draft[ballotIdx]) {
          // Delete existing votes with the same ranking (if any)
          if (value !== ABSTENTION && vote.value === value) {
            delete vote.value;
          }
          if (vote.candidateId === candidateId) {
            vote.value = value;
          }
        }
      }),
    );
  };

  return (
    <>
      <div className="flex justify-center flex-wrap gap-6 mb-4">
        {Array.from({ length: votes }).map((_, i) => (
          <Ballot
            key={`ballot${i + 1}`}
            election={election}
            ballot={ballots[i]}
            updateBallot={updateBallot(i)}
          />
        ))}
      </div>

      {!hasVoted && (
        <div className="flex justify-center">
          <VotingButton
            disabled={!votesAreValid}
            processVotes={processVotes.bind(null, election.id, entity.id, ballots)}
          />
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
    </>
  );
}
