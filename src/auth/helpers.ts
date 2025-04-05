import "server-only";

import { headers } from "next/headers";
import { auth } from ".";
import { UnauthorizedError } from "./errors/unauthorized";

async function validateSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

export async function getUser() {
  return (await validateSession()).user;
}

export async function getUserEmail() {
  return (await getUser()).email;
}
