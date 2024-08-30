import {
  BeginLoginDocument,
  BeginRegistrationDocument,
  FinalizeLoginDocument,
  FinalizeRegistrationDocument,
  FinalizeLoginMutation,
  FinalizeRegistrationMutation,
} from "generated/graphql";

import { client, ENDPOINT } from "utils/graphql";
import base64url from "base64url";

type RawAssertion = PublicKeyCredential & {
  response: AuthenticatorAssertionResponse;
};

type RawAttestation = PublicKeyCredential & {
  response: AuthenticatorAttestationResponse;
};

type Credentials = RawAttestation & {
  getPublicKey(): ArrayBuffer | null;
};

export const createCredentials = async (
  name: string,
  beginRegistration: CredentialCreationOptions,
  hasPlatformAuthenticator: boolean,
) => {
  if (!hasPlatformAuthenticator || navigator.userAgent.indexOf("Win") != -1)
    beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
      "cross-platform";
  else
    beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
      undefined;

  beginRegistration.publicKey.user.id = Buffer.from(name);
  beginRegistration.publicKey.challenge = base64url.toBuffer(
    beginRegistration.publicKey.challenge as unknown as string,
  );

  beginRegistration.publicKey.rp.id = process.env.NEXT_PUBLIC_RP_ID;
  const credentials = (await navigator.credentials.create(
    beginRegistration,
  )) as RawAttestation & {
    getPublicKey(): ArrayBuffer | null;
  };

  return credentials;
};

export const onCreateBegin = async (name: string): Promise<Credentials> => {
  const hasPlatformAuthenticator =
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  const { data } = await beginRegistration(name);
  const credentials = await createCredentials(
    name,
    data.beginRegistration,
    hasPlatformAuthenticator,
  );

  return credentials;
};

export const onCreateFinalize = (
  credentials: Credentials,
): Promise<FinalizeRegistrationMutation> => {
  return client.request(FinalizeRegistrationDocument, {
    credentials: JSON.stringify({
      id: credentials.id,
      rawId: base64url(Buffer.from(credentials.rawId)),
      type: credentials.type,
      response: {
        attestationObject: base64url(
          Buffer.from(credentials.response.attestationObject),
        ),
        clientDataJSON: base64url(
          Buffer.from(credentials.response.clientDataJSON),
        ),
      },
    }),
  });
};

export const onLoginFinalize = (
  assertion: RawAssertion,
): Promise<FinalizeLoginMutation> => {
  return client.request(FinalizeLoginDocument, {
    credentials: JSON.stringify({
      id: assertion.id,
      type: assertion.type,
      rawId: base64url(Buffer.from(assertion.rawId)),
      clientExtensionResults: assertion.getClientExtensionResults(),
      response: {
        authenticatorData: base64url(
          Buffer.from(assertion.response.authenticatorData),
        ),
        clientDataJSON: base64url(
          Buffer.from(assertion.response.clientDataJSON),
        ),
        signature: base64url(Buffer.from(assertion.response.signature)),
      },
    }),
  });
};

export const beginRegistration = async (name: string): Promise<any> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginRegistration",
      query: BeginRegistrationDocument,
      variables: {
        id: name,
      },
    }),
  );
};

export const beginLogin = async (name: string): Promise<any> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginLogin",
      query: BeginLoginDocument,
      variables: {
        id: name,
      },
    }),
  );
};

// We use XHR since fetch + webauthn causes issues with safari
export const doXHR = async (json: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", ENDPOINT);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject();
      }
    };
    xhr.onerror = () => {
      reject();
    };
    xhr.send(json);
  });
};

export async function doSignup(
  name: string,
): Promise<FinalizeRegistrationMutation> {
  console.debug("signup begin");
  const credentials: Credentials = await onCreateBegin(name);
  console.debug("signup finalize");
  return onCreateFinalize(credentials);
}

export async function doLogin(name: string, credentialId: string) {
  console.debug("login begin");
  const { data: beginLoginData } = await beginLogin(name);

  // TODO: replace with account_sdk device signer
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: base64url.toBuffer(
        beginLoginData.beginLogin.publicKey.challenge,
      ),
      timeout: 60000,
      rpId: process.env.NEXT_PUBLIC_RP_ID,
      allowCredentials: [
        {
          type: "public-key",
          id: base64url.toBuffer(credentialId),
        },
      ],
      userVerification: "required",
    },
  })) as RawAssertion;
  console.debug("login finalize");
  const res = await onLoginFinalize(assertion);
  if (!res.finalizeLogin) {
    throw Error("login failed");
  }
}
