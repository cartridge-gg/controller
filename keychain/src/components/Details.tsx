import { Box } from "@chakra-ui/react";

export type DetailsProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

const Details = ({ header, children }: DetailsProps) => {
  return (
    <Box fontSize="0.875rem">
      <Box p="4" textAlign="center" bgColor="#1E221F">
        {header}
      </Box>
      <Box p="4" bgColor="#161A17">
        {children}
      </Box>
    </Box>
  );
};

export default Details;
