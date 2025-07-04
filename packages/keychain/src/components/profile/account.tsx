import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export function Account() {
  const location = useLocation();
  const { username, project } = useParams<{
    username: string;
    project: string;
  }>();

  if (
    [`/account/${username}`, `/account/${username}/slot/${project}`].includes(
      location.pathname,
    )
  ) {
    return <Navigate to="inventory" replace />;
  }

  return <Outlet />;
}
