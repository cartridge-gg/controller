import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Consent: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // 1. Retrieve slot local server address from state param
    const code = encodeURIComponent(router.query.code as string);

    // 2. Send authorization code to the local server
    const url = new URL(router.query.state as string);
    url.searchParams.append("code", code);

    window.location.href = url.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Consent;
