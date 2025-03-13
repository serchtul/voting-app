import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WritableDraft } from 'immer';

export const ABSTENTION = 'A';
export const VOTE_FOR = 'Y';
export const VOTE_AGAINST = 'N';

export type Candidate = {
  id: string;
  name: string;
};
export type Vote = {
  candidateId: string;
  value?: string;
}
export type Ballot = Record<string, Vote>;

export type Election = {
  id: string;
  date: string; // ISO String
  name: string;
  votingTimeMin: number;
  candidates: Candidate[];
}

export type Status = 'offline' | 'voting' | 'done'; // Hardcoded for now
export type Entity = {
  id: string;
  name: string;
  code: string;
  votingState: Status;
  votes?: number; 
};

type BallotProps = {
  election: Election;
  entity: Entity;
}

type BallotActions = {
  startVoting: () => void,
  updateBallot: (ballotIdx: number) => (candidateId: string) => (vote?: string) => void,
  finishVoting: () => void
}

export type BallotState = BallotProps & {
  ballots: Ballot[];
} & BallotActions;

export const createBallotStore = ({ election, entity }: BallotProps) => {
  return create<BallotState>()(
    immer((set) => ({
      election,
      entity,
      ballots: Array.from(
        { length: entity.votes ?? 1 },
        () => Object.fromEntries(
          election.candidates.map(({ id }) => [
            id,
            { candidateId: id } as Vote
          ])
        )
      ),
      startVoting: () => set((state) => {
        state.entity.votingState = 'voting';
      }),
      updateBallot: (ballotIdx: number) => (candidateId: string) => (vote?: string) =>
        set((state) => {
          assertVotingStarted(state)
  
          const ballot = state.ballots[ballotIdx]
          if (!ballot) {
            throw new Error('Invalid ballot index');
          }
  
          if (vote && vote !== ABSTENTION) {
            // Delete existing votes with the same ranking (if any)
            for (const id of Object.keys(ballot)) {
              if (ballot[id].value === vote) {
                ballot[id].value = undefined;
                break;
              }
            }
          }
  
          state.ballots[ballotIdx][candidateId].value = vote;
        }),
      finishVoting: () => 
        set((state) => {
          assertVotingStarted(state)
          // TODO: Validations
          state.entity.votingState = 'done'
        }),
    })),
  )
}

function assertVotingStarted(state: WritableDraft<BallotState>) {
  if (state.entity.votingState !== 'voting') {
    throw new Error('Election has not started');
  }
}
