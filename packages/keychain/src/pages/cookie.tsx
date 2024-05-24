"use server";

import { Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import { cookies } from "next/headers";

const CookieDropper: NextPage = () => {
  const cookieStore = cookies();
  return (
    <Button
      onClick={async () => {
        const ok = await document.hasStorageAccess();
        if (!ok) {
          await document.requestStorageAccess();
        }

        cookieStore.set({
          name: "visited",
          value: "true",
          path: "/",
          domain: ".cartridge.gg",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
      }}
    >
      Drop Cookie!
    </Button>
  );
};

export default CookieDropper;
