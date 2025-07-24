import { Redirect, Slot, usePathname, useLocalSearchParams } from "expo-router";

export function Account() {
  const pathname = usePathname();
  const { username, project } = useLocalSearchParams<{
    username: string;
    project: string;
  }>();

  if (
    [`/account/${username}`, `/account/${username}/slot/${project}`].includes(
      pathname,
    )
  ) {
    return <Redirect href="inventory" />;
  }

  return <Slot />;
}
