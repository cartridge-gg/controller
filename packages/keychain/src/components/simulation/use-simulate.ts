import { useState, useEffect } from "react";
import { Account, type Call } from "starknet";
import { useConnection } from "@/hooks/connection";
import {
  type SimulationBalance,
  parseSimulationEvents,
  consolidateSimulationEvents,
  SimulationEvent,
} from "./event-parser";

export type SimulationError = "error" | "controller-not-deployed" | null;

export const useSimulateBalanceChanges = (
  calls: Call[],
  repeatDelayInSeconds: number,
): {
  isSimulating: boolean;
  simulationError: SimulationError;
  simulationBalances: SimulationBalance[];
} => {
  const { controller } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [simulationError, setSimulationError] = useState<SimulationError>(null);

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
        {
          skipValidate: true,
          tip: 0,
        },
      );
      return await parseSimulationEvents(results, provider, BigInt(address));
    };

    let timeoutId: NodeJS.Timeout;
    if (controller && calls.length > 0) {
      setIsLoading(true);
      simulateTransactions()
        .then((events) => {
          setSimulationEvents(events);
          setSimulationError(null);
        })
        .catch((error) => {
          // The preview simulates a tx FROM the controller. If the controller
          // isn't deployed on this chain yet — it deploys on first execute, e.g.
          // on an appchain — its sender account doesn't exist and the sim rejects
          // with "Contract not found". That's a transient not-yet-deployed state,
          // not a real failure: skip the preview rather than show a misleading
          // "Simulation Error" (the actual execute deploys the controller first).
          controller.provider
            .getClassHashAt(controller.address())
            .then(() => {
              // controller is deployed, simulated error'd
              console.warn("simulateTransactions error:", error);
              setSimulationError("error");
            })
            .catch(() => {
              // controller not deployed
              console.warn(
                "simulateTransactions error: Controller not deployed",
              );
              setSimulationError("controller-not-deployed");
            })
            .finally(() => {
              setSimulationEvents([]);
            });
        })
        .finally(() => {
          setIsLoading(false);
          if (repeatDelayInSeconds > 0) {
            timeoutId = setTimeout(() => {
              if (mounted) {
                setRepeatCounter((c) => c + 1);
              }
            }, repeatDelayInSeconds * 1000);
          }
        });
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    controller,
    calls,
    repeatCounter,
    repeatDelayInSeconds,
    setIsLoading,
    setSimulationError,
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
    simulationError,
    simulationBalances,
  };
};
