import Image from 'next/image'
import BallotCandidates from './ballot-candidates';
import { useBallotStore } from '@/store/use-ballot-store';

export default function Ballot({ idx }: { idx: number }) {
  const election = useBallotStore(state => state.election);
  const ballot = useBallotStore(state => state.ballots[idx]);
  const updateBallot = useBallotStore(state => state.updateBallot);
  
  const candidateLegend = `Candidatura${election.candidates.length === 1 ? '' : 's'}`  
  const date = new Date(election.date);

  return (
    <div className="border-2 w-100 flex flex-col items-center p-4">
      <section className='flex flex-col items-center text-center'>
        <p>AIESEC México A.C.</p>
        <p>Plenaria de Elecciones de <br /><strong>{election.name}</strong></p>
        <p>{date.toLocaleDateString('es-MX', { dateStyle: 'long' }) /** Hardcoded Locale for now */}</p>
        
        <Image
            className="w-50 my-2" // TO-DO: Set to the length of the section
            src="/Blue-Logo.png"
            width={1265}
            height={259}
            alt="Logo AIESEC (Azul)"
            priority={true}
            />

        <p className='uppercase font-bold'>Boleta de Votación</p>
        <p className='uppercase font-bold mt-2'>{candidateLegend}</p>
      </section>
      <BallotCandidates ballot={ballot} candidates={election.candidates} handleVote={updateBallot(idx)} />
    </div>
  );
}
