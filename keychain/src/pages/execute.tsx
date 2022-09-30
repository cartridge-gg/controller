import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "@cartridge/ui/components/Header";
import Approval from "components/Approval";
import Controller from "utils/account";
import { useRouter } from "next/router";
import { calculateTransactionHash } from "starknet/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/utils/transaction";
import { Call } from "starknet";
import { StarknetChainId } from "starknet/constants";
import Storage from "utils/storage";

const Execute: NextPage = () => {
  const controller = useMemo(() => Controller.fromStore(), [])
  const router = useRouter();

  const url = useMemo(() => {
    const { origin } = router.query;
    if (!origin) {
      return;
    }
    const url = new URL(origin as string);
    return url;
  }, [router.query]);

  const { version, maxFee, nonce } = router.query;
  const calls: Call[] = JSON.parse(router.query.calls as string);
  const chainId = router.query.chainId as StarknetChainId;

  useEffect(() => {
    if (!controller) {
      router.replace("/welcome");
      return
    }
  }, [router, controller])

  const calldata = fromCallsToExecuteCalldata(calls)
  const hash = calculateTransactionHash(controller.address, version, calldata, maxFee, chainId, nonce);

  const submit = useCallback(
    async (_, actions) => {
      if (!hash) {
        return;
      }

      // We set the transaction hash which the keychain instance
      // polls for.
      Storage.set(hash, true)

      if (window.opener) {
        window.close();
      }

      actions.setSubmitting(false);
    },
    [hash],
  );

  if (!url || !hash || !controller) {
    return <></>;
  }

  return (
    <>
      <Header address={controller.address} />
      <Flex m={4} flex={1} flexDirection="column">
        <Approval
          action="Execute"
          title="Execute Transactions"
          message={`${url.href} is requesting to execute the following transactions`}
          onSubmit={submit}
          scopes={calls.map((call) => ({
            target: call.contractAddress,
            method: call.entrypoint,
          }))}
        />
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Execute), { ssr: false });
