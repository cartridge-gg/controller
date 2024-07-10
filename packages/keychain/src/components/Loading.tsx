import { Center, Spinner } from "@chakra-ui/react";

export function PageLoading() {
  return (
    <Center w="full" h="100vh">
      <Spinner />
    </Center>
  );
}
