import Ballot from "@/components/ballot";

export default function Home() {
  return <>
      <h1 className="text-3xl text-center">Votaciones</h1>
      <p>
        TO-DO: Instrucciones van acá
      </p>
      <div className="flex justify-center">
        <Ballot />
      </div>
  </>;
}