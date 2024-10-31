// vocs.config.ts
import { defineConfig } from "file:///Users/os/Documents/code/cartridge/controller/node_modules/.pnpm/vocs@1.0.0-alpha.55_@types+node@22.7.5_@types+react-dom@18.3.1_@types+react@18.3.12_acorn@8.1_dbhkuv6xltg6gfwgch35geufvy/node_modules/vocs/_lib/index.js";

// package.json
var package_default = {
  name: "documentation",
  version: "0.5.0-alpha.5",
  type: "module",
  scripts: {
    dev: "vocs dev",
    build: "vocs build",
    preview: "vocs preview"
  },
  dependencies: {
    "@cartridge/connector": "^0.3.46",
    "@starknet-react/chains": "^0.1.3",
    "@starknet-react/core": "^3.0.2",
    "@types/react": "^18.2.21",
    "get-starknet-core": "^3.3.4",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.27.0",
    starknet: "^6.11.0",
    vocs: "1.0.0-alpha.55",
    yaml: "^2.3.4"
  }
};

// vocs.config.ts
var vocs_config_default = defineConfig({
  title: "Cartridge Controller",
  description: "Cartridge | Tools for onchain development",
  iconUrl: "/Cartridge.svg",
  logoUrl: "/Cartridge.svg",
  ogImageUrl: "https://og-image.preview.cartridge.gg/api/cartridge?logo=%https://www.dojoengine.org/dojo-icon.svg&title=%title&description=%description",
  theme: {
    colorScheme: "dark",
    variables: {
      color: {
        textAccent: "#ffc52a",
        background: "#0c0c0c",
        backgroundDark: "#121212",
        noteBackground: "#1a1a1a"
      }
    }
  },
  font: {
    google: "Open Sans"
  },
  topNav: [
    {
      text: package_default.version,
      items: [
        {
          text: "Releases",
          link: "https://github.com/cartridge-gg/controller/releases"
        },
        {
          text: "Changelog",
          link: "https://github.com/cartridge-gg/controller/releases"
        }
      ]
    }
  ],
  socials: [
    {
      icon: "github",
      link: "https://github.com/cartridge-gg/controller"
    },
    {
      icon: "x",
      link: "https://x.com/cartridge_gg"
    }
  ],
  editLink: {
    pattern: "https://github.com/cartridge-gg/controller/blob/main/docs/pages/:path",
    text: "Edit on GitHub"
  },
  // Banner configuration
  banner: {
    dismissable: false,
    backgroundColor: "red",
    content: "Join us in [Discord](https://discord.gg/cartridge)!",
    height: "28px",
    textColor: "white"
  },
  sidebar: [
    {
      text: "Controller",
      items: [
        {
          text: "Overview",
          link: "/controller/overview"
        },
        {
          text: "Getting Started",
          link: "/controller/getting-started"
        },
        {
          text: "Sessions",
          link: "/controller/sessions"
        },
        {
          text: "Configuration",
          link: "/controller/configuration"
        },
        {
          text: "Theming",
          link: "/controller/theming"
        },
        {
          text: "Controller Examples",
          items: [
            {
              text: "React",
              link: "/controller/examples/react"
            },
            {
              text: "Svelte",
              link: "/controller/examples/svelte"
            },
            {
              text: "Rust",
              link: "/controller/examples/rust"
            },
            {
              text: "Telegram",
              link: "/controller/examples/telegram"
            }
          ]
        }
      ]
    },
    {
      text: "Slot",
      items: [
        {
          text: "Getting Started",
          link: "/slot/getting-started"
        }
      ]
    },
    {
      text: "VRF",
      items: [
        {
          text: "Overview",
          link: "/vrf/overview"
        }
      ]
    }
  ]
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29zL0RvY3VtZW50cy9jb2RlL2NhcnRyaWRnZS9jb250cm9sbGVyL2RvY3VtZW50YXRpb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vcy9Eb2N1bWVudHMvY29kZS9jYXJ0cmlkZ2UvY29udHJvbGxlci9kb2N1bWVudGF0aW9uL3ZvY3MuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vcy9Eb2N1bWVudHMvY29kZS9jYXJ0cmlkZ2UvY29udHJvbGxlci9kb2N1bWVudGF0aW9uL3ZvY3MuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZvY3NcIjtcblxuaW1wb3J0IHBhY2thZ2VKc29uIGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHRpdGxlOiBcIkNhcnRyaWRnZSBDb250cm9sbGVyXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQ2FydHJpZGdlIHwgVG9vbHMgZm9yIG9uY2hhaW4gZGV2ZWxvcG1lbnRcIixcbiAgICBpY29uVXJsOiBcIi9DYXJ0cmlkZ2Uuc3ZnXCIsXG4gICAgbG9nb1VybDogXCIvQ2FydHJpZGdlLnN2Z1wiLFxuICAgIG9nSW1hZ2VVcmw6XG4gICAgICAgIFwiaHR0cHM6Ly9vZy1pbWFnZS5wcmV2aWV3LmNhcnRyaWRnZS5nZy9hcGkvY2FydHJpZGdlP2xvZ289JWh0dHBzOi8vd3d3LmRvam9lbmdpbmUub3JnL2Rvam8taWNvbi5zdmcmdGl0bGU9JXRpdGxlJmRlc2NyaXB0aW9uPSVkZXNjcmlwdGlvblwiLFxuXG4gICAgdGhlbWU6IHtcbiAgICAgICAgY29sb3JTY2hlbWU6IFwiZGFya1wiLFxuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgICAgICAgdGV4dEFjY2VudDogXCIjZmZjNTJhXCIsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogXCIjMGMwYzBjXCIsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZERhcms6IFwiIzEyMTIxMlwiLFxuICAgICAgICAgICAgICAgIG5vdGVCYWNrZ3JvdW5kOiBcIiMxYTFhMWFcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBmb250OiB7XG4gICAgICAgIGdvb2dsZTogXCJPcGVuIFNhbnNcIixcbiAgICB9LFxuICAgIHRvcE5hdjogW1xuICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBwYWNrYWdlSnNvbi52ZXJzaW9uLFxuICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiUmVsZWFzZXNcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY2FydHJpZGdlLWdnL2NvbnRyb2xsZXIvcmVsZWFzZXNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY2FydHJpZGdlLWdnL2NvbnRyb2xsZXIvcmVsZWFzZXNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICBdLFxuICAgIHNvY2lhbHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2NhcnRyaWRnZS1nZy9jb250cm9sbGVyXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGljb246IFwieFwiLFxuICAgICAgICAgICAgbGluazogXCJodHRwczovL3guY29tL2NhcnRyaWRnZV9nZ1wiLFxuICAgICAgICB9LFxuICAgIF0sXG4gICAgZWRpdExpbms6IHtcbiAgICAgICAgcGF0dGVybjpcbiAgICAgICAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL2NhcnRyaWRnZS1nZy9jb250cm9sbGVyL2Jsb2IvbWFpbi9kb2NzL3BhZ2VzLzpwYXRoXCIsXG4gICAgICAgIHRleHQ6IFwiRWRpdCBvbiBHaXRIdWJcIixcbiAgICB9LFxuXG4gICAgLy8gQmFubmVyIGNvbmZpZ3VyYXRpb25cbiAgICBiYW5uZXI6IHtcbiAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiSm9pbiB1cyBpbiBbRGlzY29yZF0oaHR0cHM6Ly9kaXNjb3JkLmdnL2NhcnRyaWRnZSkhXCIsXG4gICAgICAgIGhlaWdodDogXCIyOHB4XCIsXG4gICAgICAgIHRleHRDb2xvcjogXCJ3aGl0ZVwiLFxuICAgIH0sXG4gICAgc2lkZWJhcjogW1xuICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkNvbnRyb2xsZXJcIixcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRyb2xsZXIvb3ZlcnZpZXdcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJHZXR0aW5nIFN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJTZXNzaW9uc1wiLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBcIi9jb250cm9sbGVyL3Nlc3Npb25zXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiQ29uZmlndXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBcIi9jb250cm9sbGVyL2NvbmZpZ3VyYXRpb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJUaGVtaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRyb2xsZXIvdGhlbWluZ1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIkNvbnRyb2xsZXIgRXhhbXBsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlJlYWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9leGFtcGxlcy9yZWFjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlN2ZWx0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRyb2xsZXIvZXhhbXBsZXMvc3ZlbHRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiUnVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL2NvbnRyb2xsZXIvZXhhbXBsZXMvcnVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlRlbGVncmFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9leGFtcGxlcy90ZWxlZ3JhbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJTbG90XCIsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJHZXR0aW5nIFN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgbGluazogXCIvc2xvdC9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJWUkZcIixcbiAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IFwiL3ZyZi9vdmVydmlld1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIF0sXG59KTtcbiIsICJ7XG4gIFwibmFtZVwiOiBcImRvY3VtZW50YXRpb25cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC41LjAtYWxwaGEuNVwiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZvY3MgZGV2XCIsXG4gICAgXCJidWlsZFwiOiBcInZvY3MgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2b2NzIHByZXZpZXdcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAY2FydHJpZGdlL2Nvbm5lY3RvclwiOiBcIl4wLjMuNDZcIixcbiAgICBcIkBzdGFya25ldC1yZWFjdC9jaGFpbnNcIjogXCJeMC4xLjNcIixcbiAgICBcIkBzdGFya25ldC1yZWFjdC9jb3JlXCI6IFwiXjMuMC4yXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi4yMVwiLFxuICAgIFwiZ2V0LXN0YXJrbmV0LWNvcmVcIjogXCJeMy4zLjRcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIl42LjI3LjBcIixcbiAgICBcInN0YXJrbmV0XCI6IFwiXjYuMTEuMFwiLFxuICAgIFwidm9jc1wiOiBcIjEuMC4wLWFscGhhLjU1XCIsXG4gICAgXCJ5YW1sXCI6IFwiXjIuMy40XCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLG9CQUFvQjs7O0FDQWhZO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDVCxLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsY0FBZ0I7QUFBQSxJQUNkLHdCQUF3QjtBQUFBLElBQ3hCLDBCQUEwQjtBQUFBLElBQzFCLHdCQUF3QjtBQUFBLElBQ3hCLGdCQUFnQjtBQUFBLElBQ2hCLHFCQUFxQjtBQUFBLElBQ3JCLE9BQVM7QUFB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
