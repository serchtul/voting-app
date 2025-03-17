import { defineConfig } from "kysely-ctl";
import { dialect } from "../src/lib/db/dialect";

export default defineConfig({
  dialect,
});
