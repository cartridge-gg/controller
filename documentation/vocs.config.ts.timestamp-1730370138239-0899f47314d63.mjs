// vocs.config.ts
import { defineConfig } from "file:///Users/os/Documents/code/cartridge/controller/node_modules/.pnpm/vocs@1.0.0-alpha.62_@types+node@22.7.5_@types+react-dom@18.3.1_@types+react@18.3.12_acorn@8.1_6i4extsq4p37jnzg55fk2u4gyi/node_modules/vocs/_lib/index.js";
var vocs_config_default = defineConfig({
  title: "Cartridge Controller",
  description: "Cartridge | Tools for onchain development",
  iconUrl: "/Cartridge.svg",
  logoUrl: "/Cartridge.svg",
  ogImageUrl: "https://og-image.preview.cartridge.gg/api/og?logo=%https://www.dojoengine.org/dojo-icon.svg&title=%title&description=%description",
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
      text: "v0.5.0-alpha.4",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3MvRG9jdW1lbnRzL2NvZGUvY2FydHJpZGdlL2NvbnRyb2xsZXIvZG9jdW1lbnRhdGlvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29zL0RvY3VtZW50cy9jb2RlL2NhcnRyaWRnZS9jb250cm9sbGVyL2RvY3VtZW50YXRpb24vdm9jcy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29zL0RvY3VtZW50cy9jb2RlL2NhcnRyaWRnZS9jb250cm9sbGVyL2RvY3VtZW50YXRpb24vdm9jcy5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0aXRsZTogXCJDYXJ0cmlkZ2UgQ29udHJvbGxlclwiLFxuICBkZXNjcmlwdGlvbjogXCJDYXJ0cmlkZ2UgfCBUb29scyBmb3Igb25jaGFpbiBkZXZlbG9wbWVudFwiLFxuICBpY29uVXJsOiBcIi9DYXJ0cmlkZ2Uuc3ZnXCIsXG4gIGxvZ29Vcmw6IFwiL0NhcnRyaWRnZS5zdmdcIixcbiAgb2dJbWFnZVVybDpcbiAgICBcImh0dHBzOi8vb2ctaW1hZ2UucHJldmlldy5jYXJ0cmlkZ2UuZ2cvYXBpL29nP2xvZ289JWh0dHBzOi8vd3d3LmRvam9lbmdpbmUub3JnL2Rvam8taWNvbi5zdmcmdGl0bGU9JXRpdGxlJmRlc2NyaXB0aW9uPSVkZXNjcmlwdGlvblwiLFxuXG4gIHRoZW1lOiB7XG4gICAgY29sb3JTY2hlbWU6IFwiZGFya1wiLFxuICAgIHZhcmlhYmxlczoge1xuICAgICAgY29sb3I6IHtcbiAgICAgICAgdGV4dEFjY2VudDogXCIjZmZjNTJhXCIsXG4gICAgICAgIGJhY2tncm91bmQ6IFwiIzBjMGMwY1wiLFxuICAgICAgICBiYWNrZ3JvdW5kRGFyazogXCIjMTIxMjEyXCIsXG4gICAgICAgIG5vdGVCYWNrZ3JvdW5kOiBcIiMxYTFhMWFcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgZm9udDoge1xuICAgIGdvb2dsZTogXCJPcGVuIFNhbnNcIixcbiAgfSxcbiAgdG9wTmF2OiBbXG4gICAge1xuICAgICAgdGV4dDogXCJ2MC41LjAtYWxwaGEuNFwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUmVsZWFzZXNcIixcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jYXJ0cmlkZ2UtZ2cvY29udHJvbGxlci9yZWxlYXNlc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jYXJ0cmlkZ2UtZ2cvY29udHJvbGxlci9yZWxlYXNlc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2NhcnRyaWRnZS1nZy9jb250cm9sbGVyXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICBpY29uOiBcInhcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly94LmNvbS9jYXJ0cmlkZ2VfZ2dcIixcbiAgICB9LFxuICBdLFxuICBlZGl0TGluazoge1xuICAgIHBhdHRlcm46XG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9jYXJ0cmlkZ2UtZ2cvY29udHJvbGxlci9ibG9iL21haW4vZG9jcy9wYWdlcy86cGF0aFwiLFxuICAgIHRleHQ6IFwiRWRpdCBvbiBHaXRIdWJcIixcbiAgfSxcblxuICAvLyBCYW5uZXIgY29uZmlndXJhdGlvblxuICBiYW5uZXI6IHtcbiAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiLFxuICAgIGNvbnRlbnQ6IFwiSm9pbiB1cyBpbiBbRGlzY29yZF0oaHR0cHM6Ly9kaXNjb3JkLmdnL2NhcnRyaWRnZSkhXCIsXG4gICAgaGVpZ2h0OiBcIjI4cHhcIixcbiAgICB0ZXh0Q29sb3I6IFwid2hpdGVcIixcbiAgfSxcbiAgc2lkZWJhcjogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiQ29udHJvbGxlclwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXdcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb250cm9sbGVyL292ZXJ2aWV3XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdldHRpbmcgU3RhcnRlZFwiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbnRyb2xsZXIvZ2V0dGluZy1zdGFydGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNlc3Npb25zXCIsXG4gICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9zZXNzaW9uc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDb25maWd1cmF0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9jb25maWd1cmF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlRoZW1pbmdcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb250cm9sbGVyL3RoZW1pbmdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ29udHJvbGxlciBFeGFtcGxlc1wiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiUmVhY3RcIixcbiAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9leGFtcGxlcy9yZWFjdFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTdmVsdGVcIixcbiAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9leGFtcGxlcy9zdmVsdGVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiUnVzdFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9jb250cm9sbGVyL2V4YW1wbGVzL3J1c3RcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVGVsZWdyYW1cIixcbiAgICAgICAgICAgICAgbGluazogXCIvY29udHJvbGxlci9leGFtcGxlcy90ZWxlZ3JhbVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiU2xvdFwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR2V0dGluZyBTdGFydGVkXCIsXG4gICAgICAgICAgbGluazogXCIvc2xvdC9nZXR0aW5nLXN0YXJ0ZWRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlZSRlwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXdcIixcbiAgICAgICAgICBsaW5rOiBcIi92cmYvb3ZlcnZpZXdcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLG9CQUFvQjtBQUVoWSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMx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
