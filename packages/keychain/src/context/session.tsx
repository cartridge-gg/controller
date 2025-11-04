import { isPolicyRequired } from "@/components/connect/create/utils";
import { DEFAULT_SESSION_DURATION } from "@/constants";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  CreateSessionContext,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import { useCallback, useMemo, useState } from "react";
import { shortString } from "starknet";

export interface CreateSessionProviderProps {
  children: React.ReactNode;
  initialPolicies: ParsedSessionPolicies;
  requiredPolicies?: Array<ContractType>;
  chainSpecificMessages?: boolean;
}

export const CreateSessionProvider = ({
  children,
  initialPolicies,
  chainSpecificMessages: externalChainSpecificMessages,
  requiredPolicies,
}: CreateSessionProviderProps) => {
  const [policies, setPolicies] = useState<ParsedSessionPolicies>(() => {
    // Set all contract policyState to authorized
    if (initialPolicies.contracts) {
      // Object.keys(initialPolicies.contracts).forEach((address) => {
      for (const address in initialPolicies.contracts) {
        if (initialPolicies.contracts![address]) {
          initialPolicies.contracts![address].methods.forEach((method, i) => {
            method.id = `${i}-${address}-${method.name}`;
            method.authorized = true;

            // If policy type is required, set the method as required(always true)
            if (
              isPolicyRequired({
                requiredPolicyTypes: requiredPolicies ?? [],
                policyType: initialPolicies.contracts![address].meta?.type,
              })
            ) {
              method.isRequired = true;
            }
          });
        }
      }
    }

    // Set all message policyState to authorized
    if (initialPolicies.messages) {
      initialPolicies.messages.forEach((message, i) => {
        message.id = `${i}-${message.domain?.name || "unknown"}-${message.name || "message"}`;
        message.authorized = true;
      });
    }

    return initialPolicies;
  });

  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const [isEditable, setIsEditable] = useState(false);

  const { controller } = useConnection();

  const onToggleMethod = useCallback(
    (address: string, id: string, authorized: boolean) => {
      if (!policies.contracts) return;
      const contract = policies.contracts[address];
      if (!contract) return;

      const method = contract.methods.find((m) => m.id === id);
      if (!method) return;

      method.authorized = authorized;
      setPolicies({ ...policies });
    },
    [policies],
  );

  const onToggleMessage = useCallback(
    (id: string, authorized: boolean) => {
      if (!policies.messages) return;
      const message = policies.messages.find((m) => m.id === id);
      if (!message) return;

      message.authorized = authorized;
      setPolicies({ ...policies });
    },
    [policies],
  );

  const onToggleEditable = useCallback(() => {
    setIsEditable((prev) => !prev);
  }, []);

  const onDurationChange = useCallback((newDuration: bigint) => {
    setDuration(newDuration);
  }, []);

  const chainSpecificMessages = useMemo(() => {
    if (externalChainSpecificMessages) {
      return externalChainSpecificMessages;
    }

    if (!policies.messages || !controller) return [];
    return policies.messages.filter((message) => {
      return (
        !("domain" in message) ||
        (message.domain.chainId &&
          normalizeChainId(message.domain.chainId) ===
            normalizeChainId(controller.chainId()))
      );
    });
  }, [policies.messages, controller, externalChainSpecificMessages]);

  return (
    <CreateSessionContext.Provider
      value={{
        policies,
        duration,
        isEditable,
        requiredPolicies: requiredPolicies ?? [],
        chainSpecificMessages,
        onToggleMethod,
        onToggleMessage,
        onDurationChange,
        onToggleEditable,
      }}
    >
      {children}
    </CreateSessionContext.Provider>
  );
};

function normalizeChainId(chainId: number | string): string {
  if (typeof chainId === "number") {
    return `0x${chainId.toString(16)}`;
  } else {
    if (chainId.startsWith("0x")) {
      return chainId;
    } else {
      return shortString.encodeShortString(chainId);
    }
  }
}
