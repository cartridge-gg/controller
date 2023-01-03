import { VStack, HStack, Circle } from "@chakra-ui/react";
import Fingerprint from "./Fingerprint";
import QrCode from "./QrCode";
import FaceID from "./FaceID";
import Lorem from "./Lorem";
import { ReactNode } from "react";

export const AuthFingerprintImage = () => (
  <Window icon={<Fingerprint boxSize="26px" />} />
);

export const AuthQrCodeImage = () => (
  <Window icon={<QrCode boxSize="26px" />} />
);

export const AuthFaceIdImage = () => (
  <Window icon={<FaceID boxSize="26px" />} />
);

const Window = ({ icon }: { icon: ReactNode }) => {
  return (
    <VStack spacing="3px">
      <HStack
        h="24px"
        w="full"
        px="10px"
        spacing="10px"
        bgColor="gray.450"
        borderRadius="10px 10px 0 0"
      >
        <Circle size="6px" bgColor="gray.800" />
        <Circle size="6px" bgColor="gray.800" />
        <Circle size="6px" bgColor="gray.800" />
      </HStack>
      <HStack
        w="full"
        bgColor="gray.450"
        padding="12px 22px 18px 22px"
        borderRadius="0 0 10px 10px"
        justify="center"
      >
        <HStack
          bgColor="gray.500"
          px="14px"
          py="12px"
          borderRadius="5px"
          spacing="14px"
        >
          {icon} <Lorem boxSize="25px" />
        </HStack>
      </HStack>
    </VStack>
  );
};
