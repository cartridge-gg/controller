import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

export const Tabs: ComponentMultiStyleConfig = {
  parts: ["root", "tab", "tablist", "tabpanels", "tabpanel"],
  baseStyle: {
    tab: {
      userSelect: "none",
      _focus: {
        boxShadow: "none",
      },
      _selected: {
        pointerEvents: "none",
      },
    },
    tabpanel: {
      paddingX: "0",
      userSelect: "none",
    },
  },
  variants: {
    "soft-rounded": {
      tab: {
        flexDirection: "column",
        justifyContent: "space-evenly",
        color: "legacy.gray.300",
        borderRadius: "8px",
        fontSize: "0.6rem",
        textTransform: "uppercase",
        _selected: {
          color: "legacy.yellow.400",
          backgroundColor: "legacy.gray.500",
          svg: {
            stroke: "legacy.gray.500",
          },
        },
        svg: {
          height: "24px",
          width: "24px",
          stroke: "legacy.gray.700",
        },
      },
      root: {
        // prevent content hiding behind tablist on overflow
        ":after": {
          display: "block",
          content: "''",
          minHeight: "70px",
          height: "12vh",
        },
      },
      tablist: {
        minHeight: "70px",
        height: "12vh",
        left: "0",
        bottom: "0",
        position: "fixed",
        zIndex: "docked",
        gap: "5px",
        width: "full",
        padding: "8px",
        backgroundColor: "legacy.gray.700",
      },
    },
    line: {
      tab: {
        gap: "8px",
        height: "50px",
        fontSize: "0.875rem",
        letterSpacing: "0.01em",
        marginBottom: "-1px",
        borderBottom: "1px solid",
        color: "legacy.gray.200",
        px: "25px",
        _active: {
          color: "white",
          background: "none",
          borderColor: "white",
          borderBottom: "1px solid",
        },
        _selected: {
          color: "legacy.yellow.400",
        },
        _hover: {
          color: "#fff",
        },
      },
      tablist: {
        borderBottom: "1px solid",
      },
    },
  },
  defaultProps: {
    variant: "line",
  },
};
