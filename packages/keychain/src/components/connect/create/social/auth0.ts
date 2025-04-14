import { IdToken } from "@auth0/auth0-react";
import { jwtDecode, JwtPayload } from "jwt-decode";

export const getOidcToken = async (
  getIdTokenClaims: () => Promise<IdToken | undefined>,
  expectedNonce: string,
) => {
  const tokenClaims = await getIdTokenClaims();
  if (!tokenClaims) {
    throw new Error("Not authenticated with Auth0 yet");
  }

  const oidcTokenString = tokenClaims.__raw;
  if (!oidcTokenString) {
    throw new Error("Raw ID token string (__raw) not found in claims");
  }

  const decodedToken = jwtDecode<DecodedIdToken>(oidcTokenString);

  if (decodedToken.tknonce !== expectedNonce) {
    throw new Error(
      `Nonce mismatch: expected ${expectedNonce}, got ${decodedToken.tknonce}`,
    );
  }
  return tokenClaims.__raw;
};

interface DecodedIdToken extends JwtPayload {
  nonce?: string;
  tknonce?: string;
}
