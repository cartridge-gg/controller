import {
  BeginLoginDocument,
  BeginRegistrationDocument,
  FinalizeLoginDocument,
  FinalizeRegistrationDocument,
  FinalizeLoginMutation,
  FinalizeRegistrationMutation,
} from "@cartridge/utils/api/cartridge";

import { client, ENDPOINT } from "@/utils/graphql";

type RawAssertion = PublicKeyCredential & {
  response: AuthenticatorAssertionResponse;
};

type RawAttestation = PublicKeyCredential & {
  response: AuthenticatorAttestationResponse;
};

type Credentials = RawAttestation & {
  getPublicKey(): ArrayBuffer | null;
};

const createCredentials = async (
  name: string,
  beginRegistration: CredentialCreationOptions,
  hasPlatformAuthenticator: boolean,
) => {
  if (!beginRegistration.publicKey) return;
  if (beginRegistration.publicKey?.authenticatorSelection) {
    if (!hasPlatformAuthenticator || navigator.userAgent.indexOf("Win") != -1)
      beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
        "cross-platform";
    else
      beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
        undefined;
  }

  beginRegistration.publicKey.user.id = new Uint8Array(
    new TextEncoder().encode(name),
  );
  beginRegistration.publicKey.challenge = base64UrlToArrayBuffer(
    beginRegistration.publicKey.challenge as unknown as string,
  );

  // https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/pub_key_cred_params.md
  beginRegistration.publicKey.pubKeyCredParams = [
    { alg: -257, type: "public-key" },
    { alg: -7, type: "public-key" },
  ];
  beginRegistration.publicKey.rp.id = import.meta.env.VITE_RP_ID;
  const credentials = (await navigator.credentials.create(
    beginRegistration,
  )) as RawAttestation & {
    getPublicKey(): ArrayBuffer | null;
  };

  return credentials;
};

const onCreateBegin = async (
  name: string,
): Promise<Credentials | undefined> => {
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

const onCreateFinalize = (
  credentials: Credentials,
  network: string,
): Promise<FinalizeRegistrationMutation> => {
  return client.request(FinalizeRegistrationDocument, {
    network,
    credentials: JSON.stringify({
      id: credentials.id,
      rawId: arrayBufferToBase64Url(credentials.rawId),
      type: credentials.type,
      response: {
        attestationObject: arrayBufferToBase64Url(
          credentials.response.attestationObject,
        ),
        clientDataJSON: arrayBufferToBase64Url(
          credentials.response.clientDataJSON,
        ),
      },
    }),
  });
};

const onLoginFinalize = (
  assertion: RawAssertion,
): Promise<FinalizeLoginMutation> => {
  return client.request(FinalizeLoginDocument, {
    credentials: JSON.stringify({
      id: assertion.id,
      type: assertion.type,
      rawId: arrayBufferToBase64Url(assertion.rawId),
      clientExtensionResults: assertion.getClientExtensionResults(),
      response: {
        authenticatorData: arrayBufferToBase64Url(
          assertion.response.authenticatorData,
        ),
        clientDataJSON: arrayBufferToBase64Url(
          assertion.response.clientDataJSON,
        ),
        signature: arrayBufferToBase64Url(assertion.response.signature),
      },
    }),
  });
};

type BeginREgistrationTypedJson = {
  data: {
    beginRegistration: CredentialCreationOptions;
  };
};

const beginRegistration = async (
  username: string,
): Promise<BeginREgistrationTypedJson> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginRegistration",
      query: BeginRegistrationDocument,
      variables: {
        username,
      },
    }),
  );
};

type BeginLoginReturn = {
  data: {
    beginLogin: {
      publicKey: {
        challenge: string;
      };
    };
  };
};

const beginLogin = async (username: string): Promise<BeginLoginReturn> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginLogin",
      query: BeginLoginDocument,
      variables: {
        username,
      },
    }),
  );
};

// We use XHR since fetch + webauthn causes issues with safari
const doXHR = async <T>(json: string): Promise<T> => {
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
  network: string,
): Promise<FinalizeRegistrationMutation | undefined> {
  const credentials = await onCreateBegin(name);
  if (!credentials) return;
  return onCreateFinalize(credentials, network);
}

export async function doLogin({
  name,
  credentialId,
  finalize,
}: {
  name: string;
  credentialId: string;
  finalize: boolean;
}) {
  const { data: beginLoginData } = await beginLogin(name);

  // TODO: replace with account_sdk device signer
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: base64UrlToArrayBuffer(
        beginLoginData.beginLogin.publicKey.challenge,
      ),
      timeout: 60000,
      rpId: import.meta.env.VITE_RP_ID,
      allowCredentials: [
        {
          type: "public-key",
          id: base64UrlToArrayBuffer(credentialId),
        },
      ],
      userVerification: "required",
    },
  })) as RawAssertion;

  if (finalize) {
    const res = await onLoginFinalize(assertion);
    if (!res.finalizeLogin) {
      throw Error("login failed");
    }
  }
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binaryStr = atob(base64);
  const buffer = new ArrayBuffer(binaryStr.length);
  const uint8Array = new Uint8Array(buffer);

  for (let i = 0; i < binaryStr.length; i++) {
    uint8Array[i] = binaryStr.charCodeAt(i);
  }

  return buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
