import { Vote } from "lucide-react";
import { Button } from "./ui/button";
import { useBallotStore } from "@/store/use-ballot-store";
import { ABSTENTION } from "@/store/ballot";
import { z } from "zod";

const voteSchema = z
  .object({
    candidateId: z.string(),
    value: z.string(),
  })
  .array()
  .nonempty()
  .refine(
    (votes) => {
      const { abstention, voted } = Object.groupBy(votes, (vote) =>
        vote.value === ABSTENTION ? "abstention" : "voted",
      );
      const abstentions = abstention?.length ?? 0;
      const expectedVotes = Array.from(
        { length: votes.length - abstentions },
        (_, i) => `${i + 1}`,
      );

      return !voted ? true : voted.every((vote) => expectedVotes.includes(vote.value));
    },
    { message: "Votes do not match the expected order" },
  )
  .array()
  .nonempty();

export default function VotingButton() {
  const votes = useBallotStore((state) => state.ballots).map((ballot) => {
    return Object.values(ballot);
  });
  // Is this performant enough? Change for a custom implementation if it causes any issue
  const { success } = voteSchema.safeParse(votes);

  return (
    <Button disabled={!success} size="lg">
      <Vote />
      Votar
    </Button>
  );
}
