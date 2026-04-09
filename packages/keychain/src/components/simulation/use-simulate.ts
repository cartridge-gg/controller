import { useState, useEffect } from "react";
import { Account, type Call } from "starknet";
import { useConnection } from "@/hooks/connection";
import {
  type SimulationBalance,
  parseSimulationEvents,
  consolidateSimulationEvents,
  SimulationEvent,
} from "./event-parser";

export const useSimulateBalanceChanges = (
  calls: Call[],
  repeatDelayInSeconds: number,
): {
  isSimulating: boolean;
  isSimulationError: boolean;
  simulationBalances: SimulationBalance[];
} => {
  const { controller } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [repeatCounter, setRepeatCounter] = useState(0);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>(
    [],
  );
  const [simulationBalances, setSimulationBalance] = useState<
    SimulationBalance[]
  >([]);

  useEffect(() => {
    let mounted = true;

    const simulateTransactions = async () => {
      const provider = controller!.provider;
      const address = controller!.address();
      const acc = new Account({
        provider,
        address,
        signer: "0x0",
      });
      const results = await acc.simulateTransaction(
        [{ type: "INVOKE", payload: calls }],
        { skipValidate: true },
      );
      return await parseSimulationEvents(results, provider, BigInt(address));
    };

    if (controller && calls.length > 0) {
      setIsLoading(true);
      simulateTransactions()
        .then((events) => {
          setSimulationEvents(events);
          setIsError(false);
        })
        .catch((error) => {
          console.error("simulateTransactions error:", error);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
          if (repeatDelayInSeconds > 0) {
            setTimeout(() => {
              if (mounted) {
                setRepeatCounter((c) => c + 1);
              }
            }, repeatDelayInSeconds * 1000);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [
    controller,
    calls,
    repeatCounter,
    repeatDelayInSeconds,
    setIsLoading,
    setIsError,
    setSimulationEvents,
    setRepeatCounter,
  ]);

  useEffect(() => {
    if (controller && simulationEvents.length > 0) {
      const results = consolidateSimulationEvents(
        simulationEvents,
        BigInt(controller.address()),
      );
      setSimulationBalance(results);
    }
  }, [controller, simulationEvents, setSimulationBalance]);

  return {
    isSimulating: isLoading,
    isSimulationError: isError,
    simulationBalances,
  };
};
