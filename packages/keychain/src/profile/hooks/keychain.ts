import { useConnection as useKeychainConnection } from "@/hooks/connection";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useKeychain() {
  const keychainConnection = useKeychainConnection();
  const navigate = useNavigate();

  const closeModal = useCallback(async () => {
    // Navigate to home first to reset URL
    navigate("/");
    // Then use keychain's native close modal
    if (keychainConnection.closeModal) {
      await keychainConnection.closeModal();
    }
  }, [keychainConnection.closeModal, navigate]);

  const openSettings = useCallback(() => {
    // Use keychain's native open settings
    keychainConnection.openSettings();
  }, [keychainConnection.openSettings]);

  const logout = useCallback(async () => {
    // Use keychain's native logout
    await keychainConnection.logout();
  }, [keychainConnection.logout]);

  return {
    closeModal,
    openSettings,
    logout,
    chainId: keychainConnection.chainId,
  };
}
