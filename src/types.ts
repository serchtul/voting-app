export type VotingStatus = "offline" | "voting" | "done"; // Hardcoded for now

export type Entity = {
  id: string;
  name: string;
  code: string;
  votingStatus: VotingStatus;
  votes?: number;
};

export type Candidate = {
  id: string;
  name: string;
};

export type Election = {
  id: string;
  date: string; // ISO String
  name: string;
  candidates: Candidate[];
};

export type Vote = {
  candidateId: string;
  value?: string;
};

export type Ballot = Vote[];
