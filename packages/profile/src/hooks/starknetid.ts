import { useQuery } from "react-query";

export const STARKNET_ID_API_URL = "https://api.starknet.id/domain_to_addr";

export const useStarkAddress = ({ name }: { name: string }) => {
  const { data, isFetching } = useQuery({
    enabled: !!name && name.includes(".stark"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryKey: ["starknetid", name],
    queryFn: () =>
      fetch(`${STARKNET_ID_API_URL}?domain=${name}`).then((res) => res.json()),
  });

  return { address: data?.addr ?? "", isFetching };
};
