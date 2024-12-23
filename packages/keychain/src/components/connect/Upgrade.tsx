import { BoltIcon } from "@cartridge/ui-next";
import { ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { Content } from "@/components/layout";
import { useConnection } from "@/hooks/connection";

export const Upgrade = () => {
  const { upgrade, controller } = useConnection();

  return (
    <ExecutionContainer
      icon={<BoltIcon variant="solid" />}
      title={"Upgrade " + controller?.username()}
      description={""}
      transactions={upgrade.calls}
      buttonText="Upgrade"
      onSubmit={upgrade.onUpgrade}
      executionError={upgrade.error}
    >
      <Content>
        <div className="text-sm text-muted-foreground pb-2">
          Install the latest to continue
        </div>
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
