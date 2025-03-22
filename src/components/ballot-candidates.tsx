import { ABSTENTION, VOTE_AGAINST, VOTE_FOR } from "@/constants";
import BallotEntry from "./ballot-entry";
import type { Ballot, Candidate } from "@/types";

type BallotCandidatesProps = {
  handleVote: (candidateId: string, vote?: string) => void;
  ballot: Ballot;
  candidates: Candidate[];
};

export default function BallotCandidates({
  ballot,
  candidates,
  handleVote,
}: BallotCandidatesProps) {
  if (candidates.length === 0) {
    throw new Error("No candidates were provided!");
  }

  const wrapperStyles = "my-4 flex flex-col gap-3 justify-center";

  if (candidates.length === 1) {
    const candidate = candidates[0];
    const [vote] = ballot;
    const handler = (value: string) => () => {
      handleVote(candidate.id, vote.value !== value ? value : undefined);
    };

    return (
      <>
        <p className="mt-4">{candidate.name}</p>
        <div className={wrapperStyles}>
          <BallotEntry
            type="single"
            entry="A favor"
            value={vote.value === VOTE_FOR ? "X" : undefined}
            handleVote={handler(VOTE_FOR)}
          />
          <BallotEntry
            type="single"
            entry="En contra"
            value={vote.value === VOTE_AGAINST ? "X" : undefined}
            handleVote={handler(VOTE_AGAINST)}
          />
        </div>
      </>
    );
  }

  const abstentions = Object.values(ballot).filter(({ value }) => value === ABSTENTION).length;
  const options = Array.from({ length: candidates.length - abstentions }, (_, i) => String(i + 1));
  const abstentionOptions = options.concat(String(options.length + 1));
  options.push(ABSTENTION);
  abstentionOptions.push(ABSTENTION);

  return (
    <div className={wrapperStyles}>
      {candidates.map(
        (
          { name, id },
          idx, // This assumes candidates in ballots match the candidate list order
        ) => (
          <BallotEntry
            key={id}
            type="multi"
            entry={name}
            value={ballot[idx].value}
            handleVote={handleVote.bind(null, id)}
            options={ballot[idx].value === ABSTENTION ? abstentionOptions : options}
          />
        ),
      )}
    </div>
  );
}
