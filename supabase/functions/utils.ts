// Import the necessary dependencies
import * as pgp from "https://cdn.skypack.dev/openpgp";

// Define the function to generate a public key
const generateKeyPair = async (username: string) => {
  // Generate a key pair

  // @ts-ignore
  const { privateKey, publicKey } = await pgp.generateKey({
    userIDs: [{ username }],
    rsaBits: 4096, // Adjust the key size as needed
  });
  return { privateKey, publicKey };
};

export default generateKeyPair;
export function errorHandler(err: Error, status: number) {
  return new Response((err as Error).message, { status });
}
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
