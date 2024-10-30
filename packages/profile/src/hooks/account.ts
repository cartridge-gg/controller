import { useAddressByUsernameQuery } from "@cartridge/utils/api/cartridge";
import { useParams } from "react-router-dom";

export function useAddressByUsernameParam() {
  const params = useParams<{ username: string }>();
  const username = params.username ?? "";
  const { data } = useAddressByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  return {
    username,
    address: data?.account?.controllers.edges?.[0]?.node?.address ?? "",
  };
}
