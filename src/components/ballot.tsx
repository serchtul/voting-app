import Image from "next/image";
import BallotCandidates from "./ballot-candidates";
import { Ballot as BallotType, Election } from "@/types";

type BallotProps = {
  election: Election;
  ballot: BallotType;
  updateBallot: (candidateId: string, vote?: string) => void;
};

export default function Ballot({ election, ballot, updateBallot }: BallotProps) {
  const candidateLegend = `Candidatura${election.candidates.length === 1 ? "" : "s"}`;
  const date = new Date(election.date);

  return (
    <div className="border-2 w-100 flex flex-col items-center p-4">
      <section className="flex flex-col items-center text-center">
        <p>AIESEC México A.C.</p>
        <p>
          Plenaria de Elecciones de <br />
          <strong>{election.name}</strong>
        </p>
        <p>
          {
            date.toLocaleDateString("es-MX", {
              dateStyle: "long",
              timeZone: "America/Mexico_City", // Compliant with IANA Time Zone Database
            }) /** Hardcoded Locale for now */
          }
        </p>

        <Image
          className="w-50 my-2" // TO-DO: Set to the length of the section
          src="/Blue-Logo.png"
          width={1265}
          height={259}
          alt="Logo AIESEC (Azul)"
          priority={true}
        />

        <p className="uppercase font-bold">Boleta de Votación</p>
        <p className="uppercase font-bold mt-2">{candidateLegend}</p>
      </section>
      <BallotCandidates
        ballot={ballot}
        candidates={election.candidates}
        handleVote={updateBallot}
      />
    </div>
  );
}
