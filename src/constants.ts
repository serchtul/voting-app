import { Status } from "./store/ballot";

// This programmer will do anything to not use enums lol
export const status: Record<string, Status> = {
  offline: "offline",
  voting: "voting",
  done: "done",
};
