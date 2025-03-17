import { defineConfig } from "kysely-ctl";
import { dialect } from "../src/db/dialect";

export default defineConfig({
  dialect,
});
