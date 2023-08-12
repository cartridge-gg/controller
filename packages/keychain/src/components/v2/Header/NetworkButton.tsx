import { Button, Circle } from "@chakra-ui/react";

export function NetworkButton() {
  return (
    <Button size="xs" leftIcon={<Circle bg="#73C4FF" size={2} />}>
      Network
    </Button>
  );
}
