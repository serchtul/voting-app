import { Vote } from "lucide-react";
import { Button } from "./ui/button";
import { useBallotStore } from "@/store/use-ballot-store";
import { voteSchema } from "@/lib/validate/vote";

export default function VotingButton() {
  const votes = useBallotStore((state) => state.ballots).map((ballot) => {
    return Object.values(ballot);
  });
  const finishVoting = useBallotStore((state) => state.finishVoting);
  // Is this performant enough? Change for a custom implementation if it causes any issue
  const { success } = voteSchema.safeParse(votes);

  const vote = async () => {
    await finishVoting(votes);
  };

  return (
    <Button disabled={!success} size="lg" onClick={vote}>
      <Vote />
      Votar
    </Button>
  );
}
