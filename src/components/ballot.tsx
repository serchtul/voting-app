import Image from 'next/image'
import BallotCandidates from './ballot-candidates';

const electionName = "Cargo de Ejemplo"
const date = "30 de Febrero de 2025"

const candidates = [
    "Candidato Ejemplo Uno",
    "Candidato Dos Apellido Largo",
    "Candidato Tres Otro Apellido",
];
const candidateLegend = `Candidato${candidates.length === 1 ? '' : 's'}`

export default function Ballot() {
    return <div className="border-2 w-100 flex flex-col items-center p-4">
        <section className='text-center w-fit'>
            <p>AIESEC México A.C.</p>
            <p>Plenaria de Elecciones de <br /><strong>{electionName}</strong></p>
            <p>{date}</p>
            
            <Image
                className="w-50 my-2" // TO-DO: Fix to length of section
                src="/Blue-Logo.png"
                width={1265}
                height={259}
                alt="Logo AIESEC (Azul)"
                priority={true}
                />

            <p className='uppercase font-bold'>Boleta de Votación</p>
            <p className='uppercase font-bold'>{candidateLegend}</p>
        </section>
        <BallotCandidates candidates={candidates} />
    </div>;
}
