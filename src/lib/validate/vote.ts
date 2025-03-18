import { ABSTENTION } from "@/store/ballot";
import { z } from "zod";

export const voteSchema = z
  .object({
    candidateId: z.string(),
    value: z.string(),
  })
  .array()
  .nonempty()
  .refine(
    (votes) => {
      // TODO: Add logic for 1 candidate
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
