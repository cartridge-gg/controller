import { PageLoading } from "@/components/Loading";
import { CreateController } from "@/components/connect";
import { useMeQuery } from "@cartridge/utils/api/cartridge";
import { useController } from "@/hooks/controller";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { controller } = useController();
  const { data: user, isFetched } = useMeQuery();

  useEffect(() => {
    if (user && controller) {
      const query = Array.from(searchParams.entries()).reduce(
        (prev, [key, val], i) =>
          i === 0 ? `?${key}=${val}` : `${prev}&${key}=${val}`,
        "",
      );

      navigate(`/slot/consent${query}`);
    }
  }, [user, controller, navigate, searchParams]);

  if (!isFetched) {
    return <PageLoading />;
  }

  return <CreateController isSlot={true} />;
}
