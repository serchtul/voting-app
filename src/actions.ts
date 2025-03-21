"use server";

import type { Vote } from "@/store/ballot";
import type { UpdateResult } from "kysely";
import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "./db";
import { hashEmailQuery } from "./lib/hash-email";
import { nanoid } from "nanoid";
import { status } from "./constants";

import "core-js/full/typed-array/to-hex";
// Add corresponding type declaration for the polyfill
declare global {
  interface Uint8Array {
    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex MDN Reference}
     */
    toHex(): string;
  }
}

const NANOID_SIZE = 10;

// BIG TODO: Improve general error handling of this file

export async function startVoting(electionId: string, entityId: string) {
  const email = await getVoterEmail();

  // TODO: Add logging w/pino about who's starting the voting process
  console.log("entityId", entityId, "starting voting for electionId", electionId);

  let result: UpdateResult | undefined;
  try {
    result = await db
      .updateTable("electionVoter")
      .set("votingStatus", status.voting)
      .from("entity")
      .whereRef("entity.id", "=", "entityId")
      .where("votingEmail", "=", email) // Ensures election is being modified by the authorized voter
      .where("electionId", "=", electionId)
      .where("entityId", "=", entityId)
      .where("votingStatus", "=", status.offline)
      .executeTakeFirst();
  } catch (error) {
    throw new Error("There was a server error. Please try again", { cause: error });
  }

  if (result.numUpdatedRows === BigInt(0)) {
    throw new Error("Election has already been started elsewhere");
  }
}

// TODO: Extract the main parts of this process into separate functions
export async function processVotes(electionId: string, entityId: string, votes: Vote[][]) {
  const email = await getVoterEmail();

  // Validate all candidates have a vote
  const validCandidateIds = await db
    .selectFrom("candidate")
    .select("id")
    .where("electionId", "=", electionId)
    .execute();
  for (const ballot of votes) {
    if (
      ballot.length !== validCandidateIds.length ||
      !validCandidateIds.every(({ id }) => ballot.some(({ candidateId }) => id === candidateId))
    ) {
      throw new Error("All candidates must have a vote");
    }
  }

  // TODO: Add logging w/pino about who's starting the voting process
  console.log("Submitting votes for electionId", electionId, "by entityId", entityId);

  // TODO: Lock votes table to prevent new votes from being cast (is this solved with serializable transactions out of the box??)
  await db.transaction().execute(async (trx) => {
    const result = await trx
      .updateTable("electionVoter")
      .set("votingStatus", status.done)
      .from("entity")
      .whereRef("entity.id", "=", "entityId")
      .where("votingEmail", "=", email) // Ensures election is being modified by the authorized voter
      .where("electionId", "=", electionId)
      .where("entityId", "=", entityId)
      .where("votingStatus", "=", status.voting)
      .returning("votes")
      .executeTakeFirst();

    if (!result) {
      throw new Error("Election was not finished (or is already finished)");
    }

    const eyTotalVotes = result.votes;
    const ballotCount = await getSubmittedBallotCount(trx, electionId, email);

    if (ballotCount + votes.length > eyTotalVotes) {
      throw new Error("Entity can't submit more votes than they are allowed");
    }

    const ballotInserts = [];
    const ballotVoteInserts = [];

    for (const ballot of votes) {
      const ballotId = nanoid(NANOID_SIZE);

      /**
       * 128 cryptographically-strong random bits to be used as salt.
       * This should probably use a different solution in the future.
       * {@link} https://security.stackexchange.com/questions/11221/how-big-should-salt-be
       */
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);

      const salt = bytes.toHex();
      ballotInserts.push({
        id: ballotId,
        electionId,
        salt,
        votingHash: hashEmailQuery<string>(email, salt),
      });

      ballotVoteInserts.push(
        ...ballot.map((entry) => ({
          ballotId,
          candidateId: entry.candidateId,
          vote: entry.value!,
        })),
      );
    }

    await trx.insertInto("ballot").values(ballotInserts).executeTakeFirstOrThrow();
    await trx.insertInto("ballotVote").values(ballotVoteInserts).executeTakeFirstOrThrow();
  });
}

async function getVoterEmail() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  // This assumes middleware authentication has passed
  return session!.user.email;
}

// Calculate all possible hashes of casted ballots to ensure an entity is not submitting more votes than expected
function getSubmittedBallotCount(trx: typeof db, electionId: string, email: string) {
  return trx
    .selectFrom("ballot")
    .select(trx.fn.countAll().as("numBallots"))
    .where("electionId", "=", electionId)
    .whereRef("votingHash", "=", hashEmailQuery(email))
    .executeTakeFirstOrThrow()
    .then((result) => result.numBallots as number);
}
