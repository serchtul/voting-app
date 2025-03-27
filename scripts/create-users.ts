// Usage: npm run user:create

import { db } from "@/db";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { sql } from "kysely";

const COOKIE_TOKEN = null; // TODO: Set this up. An admin token is required.
const BASE_URL = "http://localhost:3000"; // TODO: Change accordingly to the App's URL

if (!COOKIE_TOKEN) {
  throw new Error("Cookie token is required. Please set its value in the script.");
}

const COOKIE_NAME = "better-auth.session_token"; // This is the default cookie name
const client = createAuthClient({
  baseURL: BASE_URL,
  fetchOptions: {
    headers: {
      Cookie: `${COOKIE_NAME}=${COOKIE_TOKEN}`,
    },
  },
  plugins: [adminClient()],
});

type ToCreate = { email: string; name: string };
const usersToCreate: ToCreate[] = [
  // TODO: This is an example, replace with actual emails and entity names (and roles, if needed)
  // { email: "user@example.com", name: "AIESEC in Xochimilco" },
];

// tsx doesn't allow top-level await in cjs transpilation
(async () => {
  const addedIds: string[] = [];

  for (const { name, email } of usersToCreate) {
    const created = await client.admin.createUser({
      name,
      email,
      role: "user",
      data: { emailVerified: true },
      password: "", // Password is required by the SDK. We'll delete them from the DB right after, to only allow logins via Google
    });

    console.log(created);
    if (created.data) {
      addedIds.push(created.data.user.id);
    }
  }

  // Delete password-based logins
  const deletedResults =
    await sql`DELETE FROM account WHERE userId IN (${sql.join(addedIds)})`.execute(db);
  console.log(deletedResults);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
