import Pusher from "pusher-js";

export function makePusherClient() {
  /**
   * Note: We perform the env checks manually because of the way Next.js handles inlining of environment variables.
   * {@link https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser Next.js Documentation}
   */
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_REGION) {
    throw new Error("Missing Pusher configuration for the browser");
  }

  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_REGION,
    authEndpoint: "/api/auth/pusher",
  });
}
