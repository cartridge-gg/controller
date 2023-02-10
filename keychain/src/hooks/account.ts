import {
  BeginLoginDocument,
  BeginRegistrationDocument,
  FinalizeLoginDocument,
  FinalizeRegistrationDocument,
  FinalizeLoginMutation,
} from "generated/graphql";

import { client, ENDPOINT } from "utils/graphql";
import base64url from "base64url";
import { RawAssertion } from "utils/webauthn";

export interface CredentialDescriptor
  extends Omit<PublicKeyCredentialDescriptor, "id"> {
  id: string;
}

export interface PublicKeyRequest
  extends Omit<
    PublicKeyCredentialRequestOptions,
    "allowCredentials" | "challenge"
  > {
  allowCredentials?: CredentialDescriptor[];
  challenge: string;
}
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
  )) as PublicKeyCredential & {
    response: AuthenticatorAttestationResponse & {
      getPublicKey(): ArrayBuffer | null;
    };
  };

  return credentials;
};

export type OnCreateResult = {
  address: string;
};

export type Credentials = PublicKeyCredential & {
  response: AuthenticatorAttestationResponse & {
    getPublicKey(): ArrayBuffer | null;
  };
};

export const onCreateBegin = async (name: string): Promise<Credentials> => {
  const hasPlatformAuthenticator =
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  const { data } = await beginRegistration(name);
  console.log({ data });
  const credentials = await createCredentials(
    name,
    data.beginRegistration,
    hasPlatformAuthenticator,
  );

  return credentials;
};

export const onCreateFinalize = async (
  deviceKey: string,
  credentials: Credentials,
) => {
  return await client.request(FinalizeRegistrationDocument, {
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
    signer: deviceKey,
  });
};

export const onLoginFinalize = async (
  assertion: RawAssertion,
): Promise<FinalizeLoginMutation> => {
  return await client.request(FinalizeLoginDocument, {
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
