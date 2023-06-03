import { Flex, Text, chakra } from "@chakra-ui/react";

export function PageBanner({
  title,
  description,
  children,
  ...rest
}: {
  title: string;
  description: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Flex>) {
  return (
    <Flex flexDirection="column" alignItems="center" paddingTop={6} {...rest}>
      {children}

      <PageTitle>
        <Text fontWeight="semibold" fontSize="lg" marginBottom={1.5}>
          {title}
        </Text>

        <Text
          fontSize="sm"
          color="darkGray.200"
        >
          {description}
        </Text>
      </PageTitle>
    </Flex>
  );
}

const PageTitle = chakra(Flex, {
  baseStyle: {
    flexDirection: "column",
    alignItems: "center",
  }
});

export const PageContainer = chakra(Flex, {
  baseStyle: {}
});

// TODO: Extend `@cartridge/ui/components/modals/SimpleModal`
export function BottomSheet({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & React.ComponentProps<typeof Flex>) {
  return (
    <Flex
      flexDirection="column"
      alignItems="stretch"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      padding={4}
      {...rest}
    >
      {children}
    </Flex>
  );
}

export function Summary({
  entries,
}: {
  entries: { icon: string, description: string }[]
}) {
  return (
    <Flex flexDirection="column">
      {entries.map((e, i) => (
        <Flex key={i} />        
      ))}
    </Flex>
  );
}
