type BallotEntryProps = {
    entry: string;
} & ({ type: 'single', vote: boolean } | { type: 'multi', vote?: 'A' | number })

export default function BallotEntry({ entry }: BallotEntryProps) {
    return <div className="flex gap-2 items-center">
        <input className="border-2 w-8 h-8 text-lg pl-2" type="text" size={1} maxLength={1} />
        <div>{entry}</div>
    </div>;
}