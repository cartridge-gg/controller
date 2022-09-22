import type { NextPage } from "next";
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "@cartridge/ui/components/Header";
import { useExecuteParams } from "hooks/account";
import Approval from "components/Approval";
import Controller from "utils/account";
import { useRouter } from "next/router";

const Execute: NextPage = () => {
  const { id, url, calls } = useExecuteParams();
  const controller = useMemo(() => Controller.fromStore(), [])
  const router = useRouter();

  useEffect(() => {
    if (!controller) {
      router.replace("/welcome");
      return
    }
  }, [router, controller])

  const submit = useCallback(
    async (values, actions) => {
      if (!id) {
        return;
      }

      try {
        const bc = new BroadcastChannel(id);
        bc.postMessage({
          approvals: values,
        });

        if (window.opener) {
          window.close();
        }
      } catch (e) {
        console.error(e);
      }
      actions.setSubmitting(false);
    },
    [id],
  );

  if (!url || !id || !controller) {
    return <></>;
  }

  return (
    <>
      <Header address={controller.address} />
      <Flex m={4} flex={1} flexDirection="column">
        <Approval
          action="Approve"
          title="Approve Transactions"
          message={`${url.href} is requesting approve for the following transactions`}
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
