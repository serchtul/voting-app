import { VotingStatus } from "@/types";

export const ABSTENTION = "A";
export const VOTE_FOR = "Y";
export const VOTE_AGAINST = "N";

// This programmer will do anything to not use enums lol
export const status: Record<VotingStatus, VotingStatus> = {
  offline: "offline",
  voting: "voting",
  done: "done",
};
