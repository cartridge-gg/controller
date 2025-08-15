import { useCallback } from "react";
import { LoginResponse, SignupResponse } from "../useCreateController";
import { Signer } from "@cartridge/controller-wasm";
import {
  generateStarknetKeypair,
  encryptPrivateKey,
  decryptPrivateKey,
} from "./crypto";

export interface PasswordSignupResponse extends SignupResponse {
  encryptedPrivateKey: string;
  publicKey: string;
}

export function usePasswordAuthentication() {
  const signup = useCallback(
    async (password: string): Promise<PasswordSignupResponse> => {
      if (!password) {
        throw new Error("Password not provided");
      }

      // Generate a new keypair for this account
      const { privateKey, publicKey } = generateStarknetKeypair();

      // Encrypt the private key with the password
      const encryptedPrivateKey = await encryptPrivateKey(privateKey, password);

      // Create a signer with the actual private key
      const signer: Signer = {
        starknet: {
          privateKey,
        },
      };

      return {
        signer,
        address: publicKey, // The public key serves as the address
        type: "password",
        encryptedPrivateKey,
        publicKey,
      };
    },
    [],
  );

  const login = useCallback(
    async (
      password: string,
      encryptedPrivateKey: string,
    ): Promise<LoginResponse> => {
      if (!password) {
        throw new Error("Password not provided");
      }

      if (!encryptedPrivateKey) {
        throw new Error("Encrypted private key not provided");
      }

      // Decrypt the private key using the password
      const privateKey = await decryptPrivateKey(encryptedPrivateKey, password);

      // Create a signer with the decrypted private key
      const signer: Signer = {
        starknet: {
          privateKey,
        },
      };

      return { signer };
    },
    [],
  );

  return {
    signup,
    login,
  };
}
