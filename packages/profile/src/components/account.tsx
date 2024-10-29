import { useAccountByUsernameParam } from "@/hooks/account";
import { useAccount } from "@/hooks/context";
import { PropsWithChildren, useEffect } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

export function Account() {
  const [searchParams] = useSearchParams();
  const { username } = useParams<{ username: string }>();

  if (username) {
    return (
      <Navigate
        to={`/account/${username}/inventory?${searchParams.toString()}`}
        replace
      />
    );
  }
  return null;
}

export function LoadAccount({ children }: PropsWithChildren) {
  const { username, address } = useAccountByUsernameParam();
  const { setAccount } = useAccount();

  useEffect(() => {
    setAccount({ username, address });
  }, [setAccount, username, address]);

  return children;
}
