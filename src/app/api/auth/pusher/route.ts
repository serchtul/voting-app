import { pusher } from "@/realtime/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { getUser } from "@/auth/helpers";

const pusherRequestSchema = z.object({
  socket_id: z.string().nonempty(),
  channel_name: z.string().nonempty(),
});

// TODO: Add logic for both presence (voters) and admin channels to handle disconnections
export async function POST(request: Request) {
  let success: boolean;
  try {
    ({ success } = await auth.api.userHasPermission({
      headers: await headers(),
      body: { permissions: { election: ["track"] } },
    }));
  } catch (error) {
    if (isAPIError(error) && error.statusCode === 401) {
      return new Response("Unauthorized", { status: 401 });
    }
    console.error(error);
    throw error;
  }
  if (!success) {
    return new Response("Forbidden", { status: 403 });
  }

  let pusherInfo: z.infer<typeof pusherRequestSchema>;
  try {
    const data = await request.formData();
    pusherInfo = pusherRequestSchema.parse(Object.fromEntries(data.entries()));
  } catch (error) {
    console.error("Error parsing body", error);
    return new Response("Invalid Body", { status: 400 });
  }

  // TODO: When we introduce multiple elections, we should check if the user has access to that particular election
  const user = await getUser();
  const authResponse = pusher.authorizeChannel(pusherInfo.socket_id, pusherInfo.channel_name, {
    user_id: user.id,
  });
  return Response.json(authResponse);
}
