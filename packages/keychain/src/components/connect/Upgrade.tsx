import { BoltIcon } from "@cartridge/ui";
import { ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react";
import { ExecutionContainer } from "components/ExecutionContainer";
import { Content } from "components/layout";
import { useConnection } from "hooks/connection";
export const Upgrade = () => {
  const { upgrade, controller } = useConnection();

  return (
    <ExecutionContainer
      Icon={BoltIcon}
      title={"Upgrade " + controller?.username}
      description={""}
      transactions={[]} // Disables estimate fee since upgrade is free
      buttonText="Upgrade"
      onSubmit={upgrade.onUpgrade}
      executionError={upgrade.error}
    >
      <Content>
        <Text color="text.secondary" fontSize="sm" pb="10px">
          Install the latest to continue
        </Text>
        <VStack
          w="full"
          align="left"
          border="1px"
          borderLeft="10px solid"
          borderColor="darkGray.600"
          borderRadius="4px"
          bgColor="darkGray.700"
          py="16px"
          px="20px"
        >
          <Text color="text.secondary" fontSize="sm" fontWeight="bold">
            Upgrade Details
          </Text>
          <UnorderedList>
            {upgrade.latest?.changes.map((item, i) => (
              <ListItem key={i} fontSize="sm">
                {item}
              </ListItem>
            ))}
          </UnorderedList>
        </VStack>
      </Content>
    </ExecutionContainer>
  );
};
