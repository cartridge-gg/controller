import { useUsernameEffect } from "@/hooks/context";
import { PropsWithChildren } from "react";
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
  const params = useParams<{ username: string }>();
  useUsernameEffect(params.username ?? "");

  return children;
}
