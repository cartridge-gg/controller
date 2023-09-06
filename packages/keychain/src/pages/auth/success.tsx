import { NextPage } from "next";
import { Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Consent: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log(router.query.code, router.query.redirect_uri);
  }, [router.query.code, router.query.redirect_uri]);

  return <Text>Success</Text>;
};

export default Consent;
