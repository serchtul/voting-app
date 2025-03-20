import { sql } from "kysely";

export const hashEmailQuery = <T = unknown>(email: string, salt?: string) =>
  sql<T>`encode(sha256(concat(${email},${salt ?? sql.ref("salt")})), 'hex')`;
