import { Kysely } from "kysely";
import type { DB } from "./db";
import { dialect } from "./dialect";

export const db = new Kysely<DB>({
  dialect,
});
