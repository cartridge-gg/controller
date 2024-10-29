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
