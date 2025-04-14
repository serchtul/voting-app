type ElectionEvent = "entityVoting" | "entityVoted";
export const adminEvents: Record<ElectionEvent, ElectionEvent> = {
  entityVoting: "entityVoting",
  entityVoted: "entityVoted",
};

export const getAdminChannelName = (electionId: string) => `private-election-${electionId}-admin`;
