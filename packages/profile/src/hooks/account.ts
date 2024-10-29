import { useAccountByUsernameQuery } from "@cartridge/utils/api/cartridge";
import { useParams } from "react-router-dom";

export function useAccountByUsernameParam() {
  const params = useParams<{ username: string }>();
  const username = params.username ?? "";
  const { data } = useAccountByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  return {
    username,
    address:
      data?.accounts?.edges?.[0]?.node?.controllers?.edges?.[0]?.node
        ?.address ?? "",
  };
}
