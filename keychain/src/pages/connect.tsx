import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Flex } from "@chakra-ui/react";

import Banner from "components/Banner";
import { Header } from "components/Header";
import Session from "components/Session";
import { useRequests } from "hooks/account";
import { useUrlPolicys } from "hooks/policy";
import Controller from "utils/controller";

const Connect: NextPage = () => {
  const [maxFee, setMaxFee] = useState(null);
  const { chainId, validPolicys, invalidPolicys, isValidating } =
    useUrlPolicys();
  const { origin } = useRequests();
  const controller = useMemo(() => Controller.fromStore(), []);
  const router = useRouter();

  useEffect(() => {
    if (!controller) {
      router.replace(
        `${
          process.env.NEXT_PUBLIC_ADMIN_URL
        }/welcome?redirect_uri=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }
  }, [router, controller]);

  const approve = useCallback(
    async (values, actions) => {
      try {
        const approvals = validPolicys.filter((_, i) => values[i]);
        controller.approve(origin, approvals, maxFee);
        if (window.opener) {
          window.close();
        }
      } catch (e) {
        console.error(e);
      }
      actions.setSubmitting(false);
    },
    [origin, validPolicys, controller, maxFee],
  );

  if (!controller) {
    return <></>;
  }

  return (
    <>
      <Header address={controller.address} />
      <Flex m={4} flex={1} flexDirection="column">
        <Banner
          pb="20px"
          title="Session Details"
          variant="secondary"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          {
            <>
              <strong>{origin}</strong>
              {validPolicys.length > 0
                ? " is requesting permission to submit transactions on your behalf"
                : " is requesting to connect to your account"}
            </>
          }
        </Banner>
        <Session
          chainId={chainId}
          action={
            "CONFIRM" +
            (validPolicys.length > 0 ? ` [${validPolicys.length + 1}]` : "")
          }
          onCancel={() => {
            if (window.opener) {
              window.close();
            }
          }}
          onSubmit={approve}
          policies={validPolicys}
          invalidPolicys={invalidPolicys}
          isLoading={isValidating}
          maxFee={maxFee}
          setMaxFee={setMaxFee}
        />
      </Flex>
    </>
  );
};

export default dynamic(() => Promise.resolve(Connect), { ssr: false });
