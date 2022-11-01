import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "components/Header";
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

  const params = useMemo(() => {
    if (!controller.address || !router.query.chainId || !router.query.calls || !router.query.version || !router.query.maxFee || !router.query.nonce) {
      return null
    }

    const { version, maxFee, nonce, chainId } = router.query as {
      chainId: StarknetChainId,
      version: string,
      maxFee: string,
      nonce: string,
    }
    const calls: Call | Call[] = JSON.parse(router.query.calls as string)
    const transactions = Array.isArray(calls) ? calls : [calls];

    const calldata = fromCallsToExecuteCalldata(transactions)
    const hash = calculateTransactionHash(controller.address, version, calldata, maxFee, chainId, nonce);

    return { hash, calls: transactions, maxFee, nonce }
  }, [controller.address, router.query])

  useEffect(() => {
    if (!controller) {
      router.replace(`${process.env.NEXT_PUBLIC_SITE_URL}/welcome`);
      return
    }
  }, [router, controller])

  const submit = useCallback(
    async (_, actions) => {
      if (!params.hash) {
        return;
      }

      // We set the transaction hash which the keychain instance
      // polls for.
      Storage.set(params.hash, true)

      if (window.opener) {
        window.close();
      }

      actions.setSubmitting(false);
    },
    [params],
  );

  if (!url || !params || !controller) {
    return <>
      <Header address={controller.address} />
    </>;
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
          policies={params.calls.map((call) => ({
            target: call.contractAddress,
            method: call.entrypoint,
          }))}
        />
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Execute), { ssr: false });
