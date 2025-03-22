import { status } from "@/constants";
import { Entity } from "@/types";

export function assertEntityIsVoting(entity: Entity) {
  if (entity.votingStatus !== status.voting) {
    throw new Error("Entity has not started voting or has already voted");
  }
}
