import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { processVotes, startVoting } from "@/actions";

export const ABSTENTION = "A";
export const VOTE_FOR = "Y";
export const VOTE_AGAINST = "N";

export type Candidate = {
  id: string;
  name: string;
};
export type Vote = {
  candidateId: string;
  value?: string;
};
export type Ballot = Record<string, Vote>;

export type Election = {
  id: string;
  date: string; // ISO String
  name: string;
  candidates: Candidate[];
};

export type Status = "offline" | "voting" | "done"; // Hardcoded for now
export type Entity = {
  id: string;
  name: string;
  code: string;
  votingStatus: Status;
  votes?: number;
};

type BallotProps = {
  election: Election;
  entity: Entity;
  ballots?: Ballot[];
};

type BallotActions = {
  startVoting: () => Promise<void>;
  updateBallot: (ballotIdx: number) => (candidateId: string) => (vote?: string) => void;
  finishVoting: (votes: Vote[][]) => Promise<void>;
};

export type BallotState = BallotProps & {
  ballots: Ballot[];
} & BallotActions;

export const createBallotStore = ({ election, entity, ballots }: BallotProps) => {
  return create<BallotState>()(
    immer((set, get) => ({
      election,
      entity,
      ballots:
        ballots ??
        Array.from({ length: entity.votes ?? 1 }, () =>
          Object.fromEntries(
            election.candidates.map(({ id }) => [id, { candidateId: id } as Vote]),
          ),
        ),
      startVoting: async () => {
        const state = get();
        if (state.entity.votingStatus !== "offline") {
          return;
        }

        await startVoting(state.election.id, state.entity.id);

        set((state) => {
          state.entity.votingStatus = "voting";
        });
      },
      updateBallot: (ballotIdx: number) => (candidateId: string) => (vote?: string) =>
        set((state) => {
          assertVotingStarted(state);

          const ballot = state.ballots[ballotIdx];
          if (!ballot) {
            throw new Error("Invalid ballot index");
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
      finishVoting: async (votes: Vote[][]) => {
        const state = get();
        assertVotingStarted(state);

        await processVotes(state.election.id, state.entity.id, votes);

        set((state) => {
          state.entity.votingStatus = "done";
        });
      },
    })),
  );
};

function assertVotingStarted(state: BallotState) {
  if (state.entity.votingStatus !== "voting") {
    throw new Error("Entity has not started voting or has already voted");
  }
}
