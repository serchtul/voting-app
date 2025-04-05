import { pusher } from "@/realtime/server";
import { ELECTION_PREFIX, PRESENCE_PREFIX } from "@/realtime/constants";
import { getUser } from "@/auth/helpers";
import { db } from "@/db";
import { z } from "zod";

const pusherRequestSchema = z.object({
  socket_id: z.string().nonempty(),
  channel_name: z.string().nonempty(),
});

export async function POST(request: Request) {
  const user = await getUser();
  console.log(user);

  let pusherInfo: z.infer<typeof pusherRequestSchema>;
  let electionId: string;
  try {
    const data = await request.formData();
    pusherInfo = pusherRequestSchema.parse(Object.fromEntries(data.entries()));
    electionId = await getElectionId(pusherInfo.channel_name);

    // TODO: Delete
    console.log(pusherInfo);
  } catch (error) {
    console.error("Error parsing body", error);
    return new Response("Invalid Body", { status: 400 });
  }

  let entityId: string;
  try {
    entityId = await getVotingEntity(electionId, user.email);
  } catch (error) {
    console.error("DB error", error);
    return new Response("Unauthorized", { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(pusherInfo.socket_id, pusherInfo.channel_name, {
    user_id: user.id,
    user_info: { entityId },
  });
  return Response.json(authResponse);
}

async function getElectionId(channelName: string) {
  const prefix = `${PRESENCE_PREFIX}${ELECTION_PREFIX}`;

  if (!channelName.startsWith(prefix)) {
    throw new Error("Invalid channel name");
  }
  return channelName.slice(prefix.length);
}

/**
 * This function verifies that the user can indeed vote in the election.
 * Returns the associated entityId for the user, if they have access.
 * If they do not have access, an error is thrown.
 *
 * @param electionId
 * @param userEmail
 * @returns entityId
 */
async function getVotingEntity(electionId: string, userEmail: string) {
  // TODO: Update entity table to reference a userId instead of using the email
  const result = await db
    .selectFrom("electionVoter")
    .innerJoin("entity", "entityId", "entity.id")
    .select("entityId")
    .where("electionId", "=", electionId)
    .where("entity.votingEmail", "=", userEmail)
    .executeTakeFirstOrThrow();

  return result.entityId;
}
