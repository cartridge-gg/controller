import { LoadingLogo } from "components";
import { CreateController } from "components/connect"
import { useMeQuery } from "generated/graphql";
import { useController } from "hooks/controller";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Auth() {
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

      router.replace(`/slot/auth/consent${query}`);
    }
  }, [user, controller, router]);

  if (!isFetched) {
    return <LoadingLogo />;
  }

  return <CreateController isSlot={true} />;
}
