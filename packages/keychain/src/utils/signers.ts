import { Signer, signerToGuid } from "@cartridge/controller-wasm";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { constants } from "starknet";
import Controller from "./controller";

export const toJsSigner = (signer: CredentialMetadata): Signer | undefined => {
  switch (signer.__typename) {
    case "Eip191Credentials":
      return {
        eip191: {
          address: signer.eip191?.[0]?.ethAddress ?? "",
        },
      };
    case "WebauthnCredentials":
      return {
        webauthn: {
          publicKey: signer.webauthn?.[0]?.publicKey ?? "",
          rpId: import.meta.env.VITE_RP_ID,
          credentialId: signer.webauthn?.[0]?.id ?? "",
        },
      };
    case "SIWSCredentials": // TODO: implement
    case "StarknetCredentials": // TODO: implement
    case "PasswordCredentials": // TODO: implement
    default:
      console.error(`Unimplemented signer:`, signer.__typename);
      return undefined;
  }
};

export const isCurrentSigner = (
  signer: CredentialMetadata,
  controller: Controller,
) => {
  const jsSigner = toJsSigner(signer);
  if (!jsSigner) return false;
  const signerGuid = signerToGuid(jsSigner);
  const controllerGuid = controller.ownerGuid();
  return signerGuid === controllerGuid;
};

export const processControllerQuery = (
  data: ControllerQuery,
  chainId: string,
): ControllerQuery => {
  if (!data?.controller) {
    return data;
  }

  const validSigners = data?.controller?.signers?.filter(
    (signer) => !signer.isRevoked,
  );

  if (chainId === constants.StarknetChainId.SN_MAIN) {
    return {
      ...data,
      controller: {
        ...data.controller,
        signers: validSigners,
      },
    };
  }

  return {
    ...data,
    controller: {
      ...data.controller,
      signers:
        validSigners && validSigners.length > 0
          ? validSigners.filter((x) => x.isOriginal)
          : undefined,
    },
  };
};
