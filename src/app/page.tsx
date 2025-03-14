import VotingForm from "@/components/voting-form";
import type { Election, Entity } from "@/store/ballot";

// Pending API calls fetching candidates and EY info (number votes)
export default function Home() {
  // TODO: Retrieve from API
  const election: Election = {
    id: "test123",
    name: "Cargo de Ejemplo",
    date: new Date().toISOString(), // ISO String
    votingTimeMin: 5, // Optional. No limit if not present
    candidates: [
      { id: "cand1", name: "Candidato Ejemplo Uno" },
      { id: "cand2", name: "Candidato Dos Apellido Largo" },
      { id: "cand3", name: "Candidato Tres Otro Apellido" },
      { id: "cand4", name: "Le Candidate Numero Cuatro" },
    ],
  };

  const exampleEntity: Entity = {
    id: "entity1",
    name: "Random",
    code: "RND",
    votingState: "voting",
  };

  return (
    <>
      <h1>Votaciones</h1>
      <VotingForm election={election} entity={exampleEntity} />
    </>
  );
}
