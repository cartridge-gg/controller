import { menuAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers(menuAnatomy.keys);

export const Menu: ComponentStyleConfig = helpers.defineMultiStyleConfig({});
