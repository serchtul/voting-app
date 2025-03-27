import { betterAuth } from "better-auth";
import { dialect } from "./db/dialect";
import { admin } from "better-auth/plugins";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials! Please set the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
  );
}

export const auth = betterAuth({
  database: {
    dialect,
    type: "sqlite",
  },
  plugins: [admin()],
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
});
