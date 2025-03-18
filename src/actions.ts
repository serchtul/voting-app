"use server";

import type { Status, Vote } from "@/store/ballot";
import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "./db";
import { UpdateResult } from "kysely";

export async function startVoting(electionId: string, entityId: string) {
  const email = await getVoterEmail();
  const offlineStatus: Status = "offline";
  const votingStatus: Status = "voting";

  // TODO: Add logging w/pino about who's starting the voting process
  console.log("entityId", entityId, "starting voting for electionId", electionId);

  let result: UpdateResult | undefined;
  try {
    result = await db
      .updateTable("electionVoter")
      .set("votingStatus", votingStatus)
      .from("entity")
      .whereRef("entity.id", "=", "entityId")
      .where("votingEmail", "=", email) // Ensures election is being modified by the authorized voter
      .where("electionId", "=", electionId)
      .where("entityId", "=", entityId)
      .where("votingStatus", "=", offlineStatus)
      .executeTakeFirst();
  } catch (error) {
    throw new Error("There was a server error. Please try again", { cause: error });
  }

  if (result.numUpdatedRows === BigInt(0)) {
    throw new Error("Election has already been started elsewhere");
  }
}

export async function processVotes(electionId: string, entityId: string, votes: Vote[][]) {
  const email = await getVoterEmail();
  const doneStatus: Status = "done";

  // TODO: Add logging w/pino about who's starting the voting process
  console.log("Got votes", votes);

  let result: UpdateResult | undefined;
  try {
    // TODO: Maybe split this into several transaction-wrapped checks to be more specific with errors?
    result = await db
      .updateTable("electionVoter")
      .set("votingStatus", doneStatus)
      .from("entity")
      .whereRef("entity.id", "=", "entityId")
      .where("votingEmail", "=", email) // Ensures election is being modified by the authorized voter
      .where("electionId", "=", electionId)
      .where("entityId", "=", entityId)
      .where("votingStatus", "!=", doneStatus)
      .executeTakeFirst();
  } catch (error) {
    throw new Error("There was a server error. Please try again", { cause: error });
  }

  if (result.numUpdatedRows === BigInt(0)) {
    throw new Error("Election was not finished (or is already finished)");
  }

  // TODO: Implement ballot-saving in the backend
}

async function getVoterEmail() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  // This file assumes middleware authentication has passed
  return session!.user.email;
}
