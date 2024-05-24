import { Button } from "@chakra-ui/react";
import type { NextPage } from "next";

const Cookie: NextPage = () => {
  return (
    <>
      <Button
        onClick={() => {
          if (!!document.hasStorageAccess) {
            const ok = document.hasStorageAccess();
            if (!ok) {
              document
                .requestStorageAccess()
                .then(() => {
                  console.log("successful storage access requested!");
                })
                .catch((e) => {
                  console.error(e);
                });
            } else {
              console.log("already has storage access");
            }
          }

          document.cookie = "visited=true; path=/;";
        }}
      >
        Drop Cookie!
      </Button>
    </>
  );
};

export default Cookie;
