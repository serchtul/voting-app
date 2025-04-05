import "server-only";

import Pusher from "pusher";
import { z } from "zod";

export const schema = z.object({
  PUSHER_APP_ID: z.string().nonempty(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().nonempty(),
  PUSHER_SECRET: z.string().nonempty(),
  NEXT_PUBLIC_PUSHER_REGION: z.string().nonempty(),
});

const pusherVars = schema.parse(process.env);

export const pusher = new Pusher({
  appId: pusherVars.PUSHER_APP_ID,
  key: pusherVars.NEXT_PUBLIC_PUSHER_KEY,
  secret: pusherVars.PUSHER_SECRET,
  cluster: pusherVars.NEXT_PUBLIC_PUSHER_REGION,
  useTLS: true, // The app is configured to require TLS, so this shouldn't change
});
