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
  const signup = useCallback(async (): Promise<PasswordSignupResponse> => {
    // Get password from sessionStorage (set by ChooseSignupMethodForm)
    const password = sessionStorage.getItem("temp_password");
    const mode = sessionStorage.getItem("temp_password_mode");

    // Clear temporary storage
    sessionStorage.removeItem("temp_password");
    sessionStorage.removeItem("temp_password_mode");

    if (!password) {
      throw new Error("Password not provided");
    }

    if (mode !== "signup") {
      throw new Error("Invalid password mode for signup");
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
  }, []);

  const login = useCallback(async (): Promise<LoginResponse> => {
    // Get password and encrypted signer from sessionStorage
    const password = sessionStorage.getItem("temp_password");
    const mode = sessionStorage.getItem("temp_password_mode");
    const encryptedSigner = sessionStorage.getItem("temp_encrypted_signer");

    // Clear temporary storage
    sessionStorage.removeItem("temp_password");
    sessionStorage.removeItem("temp_password_mode");
    sessionStorage.removeItem("temp_encrypted_signer");

    if (!password) {
      throw new Error("Password not provided");
    }

    if (mode !== "login") {
      throw new Error("Invalid password mode for login");
    }

    if (!encryptedSigner) {
      throw new Error("Encrypted signer not provided");
    }

    // Decrypt the private key using the password
    const privateKey = await decryptPrivateKey(encryptedSigner, password);

    // Create a signer with the decrypted private key
    const signer: Signer = {
      starknet: {
        privateKey,
      },
    };

    return { signer };
  }, []);

  return {
    signup,
    login,
  };
}
