import ImageKit from "imagekit";
import { env } from "../../config/env";

const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

export function createAuthSign() {
  const auth = imagekit.getAuthenticationParameters();
  return {
    ...auth,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
  };
}
