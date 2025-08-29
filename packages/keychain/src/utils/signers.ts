import { Signer, signerToGuid } from "@cartridge/controller-wasm";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";
import { constants } from "starknet";
import Controller from "./controller";

export const toJsSigner = (signer: CredentialMetadata): Signer => {
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
    default:
      throw new Error("Unimplemented");
  }
};

export const isCurrentSigner = (
  signer: CredentialMetadata,
  controller: Controller,
) => {
  const signerGuid = signerToGuid(toJsSigner(signer));
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
