import { PageLoading } from "components/Loading";
import { CreateController } from "components/connect";
import { useMeQuery } from "generated/graphql";
import { useController } from "hooks/controller";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Auth() {
  const router = useRouter();
  const { controller } = useController();
  const { data: user, isFetched } = useMeQuery();

  useEffect(() => {
    if (user && controller) {
      const query = Object.entries(router.query).reduce(
        (prev, [key, val], i) =>
          i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
        "",
      );

      router.replace(`/slot/consent${query}`);
    }
  }, [user, controller, router]);

  if (!isFetched) {
    return <PageLoading />;
  }

  return <CreateController isSlot={true} />;
}

export default dynamic(() => Promise.resolve(Auth), { ssr: false });
