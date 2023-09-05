import { Button, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useCallback } from "react";

const Consent: NextPage = () => {
  const onSubmit = useCallback(async () => {
    console.log("TODO: Submit");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      // body: ``,
    });

    console.log(res);
  }, []);

  return (
    <>
      <Text>CONTENT</Text>
      <Button onClick={onSubmit}>Authorise</Button>
    </>
  );
};

export default Consent;
