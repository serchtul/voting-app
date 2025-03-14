import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const dbUrl = process.env.TURSO_DATABASE_URL;
if (!dbUrl) {
  throw new Error("Missing TURSO_DATABASE_URL environment variable!");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials! Please set the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
  );
}

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN ?? "",
    }),
    type: "sqlite",
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
});
