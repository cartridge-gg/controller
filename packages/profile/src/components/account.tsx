import { Navigate, useParams } from "react-router-dom";

export function Account() {
  const { username, project } = useParams<{
    username: string;
    project: string;
  }>();

  if (username) {
    const url = project
      ? `/account/${username}/slot/${project}/inventory`
      : `/account/${username}/inventory`;
    return <Navigate to={url} replace />;
  }
  return null;
}
