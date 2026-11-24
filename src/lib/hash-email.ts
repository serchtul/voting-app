import { createHash } from "node:crypto";

export const hashEmail = (email: string, salt: string) =>
  createHash("sha256")
    .update(email + salt)
    .digest("hex");

export const isCastBy = (email: string, ballot: { salt: string; votingHash: string }) =>
  hashEmail(email, ballot.salt) === ballot.votingHash;
