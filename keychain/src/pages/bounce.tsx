import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Storage from "utils/storage";

// Safari iframe cookie workaround
// https://gist.github.com/iansltx/18caf551baaa60b79206
const Bounce: NextPage = () => {
  const router = useRouter();
  const { redirect_uri } = router.query as { redirect_uri: string };

  useEffect(() => {
    if (redirect_uri) {
      const isSafari =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isSafari) {
        document.cookie = "bounced=true; path=/;";
      }

      router.replace(redirect_uri);
    }
  }, [redirect_uri]);
  return <></>;
};

export default dynamic(() => Promise.resolve(Bounce), { ssr: false });
