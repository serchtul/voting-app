import { useContext } from "react";
import { useStore } from "zustand";
import { type BallotState } from "./ballot";
import { BallotContext } from "./context";

export function useBallotStore<T>(selector: (state: BallotState) => T): T {
  const store = useContext(BallotContext);
  if (!store) throw new Error("Missing BallotContext.Provider in the tree");
  return useStore(store, selector);
}
