"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type BallotEntryProps = {
  entry: string;
  value?: string;
  handleVote: (vote?: string) => void;
} & ({ type: "single"; value?: "X" } | { type: "multi"; options: string[] });

export default function BallotEntry(props: BallotEntryProps) {
  const flexStyle = "flex gap-2 items-center";
  const boxStyle = "border-2 size-8 p-0 text-lg justify-center rounded-none";

  if (props.type === "single") {
    return (
      <div className={flexStyle}>
        <Button
          variant={"outline"}
          onClick={() => props.handleVote()}
          className={cn(
            // Copied from the SelectTrigger styles
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:line-clamp-1",
            boxStyle,
            "font-bold",
          )}
        >
          {props.value}
        </Button>
        {props.entry}
      </div>
    );
  }

  return (
    <div className={flexStyle}>
      <Select value={props.value || ""} onValueChange={props.handleVote}>
        <SelectTrigger className={boxStyle}>
          <SelectValue>
            {props.value /** A workaround to make number strings work properly. */}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="block">
          {props.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div>{props.entry}</div>
    </div>
  );
}
