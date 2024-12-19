import {
  Badge,
  TableContainer,
  Table as ChakraTable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { CopyText } from "@/components";

const meta: Meta<typeof Table> = {
  title: "Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

function Table() {
  return (
    <TableContainer>
      <ChakraTable>
        <Thead>
          <Tr>
            <Th>age</Th>
            <Th>hash</Th>
            <Th>player</Th>
            <Th>status</Th>
          </Tr>
        </Thead>

        <Tbody>
          <Tr>
            <Td>12 mins</Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>

            <Td>
              <Badge>pending</Badge>
            </Td>
          </Tr>

          <Tr>
            <Td>12 mins</Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>

            <Td>
              <Badge>pending</Badge>
            </Td>
          </Tr>

          <Tr>
            <Td>12 mins</Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>
            <Td>
              <CopyText
                value="0x0000...0000"
                copyValue="0x0000000000000000000000000000000000000000"
              />
            </Td>

            <Td>
              <Badge>pending</Badge>
            </Td>
          </Tr>
        </Tbody>
      </ChakraTable>
    </TableContainer>
  );
}
