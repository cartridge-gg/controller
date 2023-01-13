import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Text, Container } from "@chakra-ui/react";
import Footer from "components/Footer";
import { motion } from "framer-motion";
import { Header } from "components/Header";
import { useInterval } from "usehooks-ts";
import Controller from "utils/controller";

const Continue: NextPage = () => {
  const router = useRouter();
  const [controller, setController] = useState<Controller>();

  useInterval(
    () => setController(Controller.fromStore()),
    controller ? null : 1000,
  );

  useEffect(() => {
    if (controller) {
      const { redirect_uri } = router.query as { redirect_uri: string };
      if (redirect_uri) {
        router.replace(redirect_uri);
      }
    }
  }, [controller, router]);

  return (
    <>
      <Header />
      <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        w={["full", "400px"]}
        h="calc(100vh - 74px)"
        pt="100px"
        centerContent
      >
        <Text>Please continue with signup in the new window.</Text>
        <Footer showConfirm={false} cancelText="Close" onCancel={() => {}} />
      </Container>
    </>
  );
};

export default Continue;
