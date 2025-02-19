import type { JSX } from "react";
import BallotEntry from "./ballot-entry";

type BallotCandidatesProps = {
  candidates: string[]
}

const entryWrapper = (children: JSX.Element[]) =>
  <div className="my-4 flex flex-col gap-3 justify-center">
    {children}
  </div>

export default function BallotCandidates({ candidates }: BallotCandidatesProps) {
  if (candidates.length === 0) {
    throw new Error("No candidates were provided!");
  }

  if (candidates.length === 1) {
    return <>
      <p>{candidates[0]}</p>
      {entryWrapper([
        <BallotEntry key="for" type="single" entry="A favor" vote={false} />,
        <BallotEntry key="against" type="single" entry="En contra" vote={false} />
      ])}
    </>
  }

  return entryWrapper(candidates.map((candidate) =>
    <BallotEntry key={candidate} type="multi" entry={candidate} />
  ));
}