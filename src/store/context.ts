import { createContext } from "react";
import type { createBallotStore } from "./ballot";

type BallotStore = ReturnType<typeof createBallotStore>;
export const BallotContext = createContext<BallotStore | null>(null);
