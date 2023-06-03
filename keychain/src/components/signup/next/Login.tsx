import { Circle, Button, Flex } from "@chakra-ui/react";
import Fingerprint from "@cartridge/ui/components/icons/Fingerprint";
import { PageBanner, BottomSheet, PageContainer } from "./layout";
import { Props } from "./types";

export function Login({
  onSignup,
}: Props & { onSignup: () => void }) {
  return (
    <Flex flexDirection="column" flex={1}>
      <PageBanner title="Log In" description="Enter your username">
        <Circle size={12} bgColor="darkGray.800" marginBottom={4}>
          <Fingerprint boxSize={8} color="green.200" />
        </Circle>
      </PageBanner>
      
      <PageContainer></PageContainer>
      
      <BottomSheet>
        <Button
          variant="yellow"
          marginBottom={4}
          // disabled={isDisabled || isLoading}
          // isLoading={isLoading}
          // onClick={onConfirm}
        >
          Log In
        </Button>

        <Button
          variant="darkGray"
          // disabled={isDisabled || isLoading}
          // isLoading={isLoading}
          onClick={onSignup}
        >
          Create New
        </Button>
      </BottomSheet>
    </Flex>
  ); 
}
