import { defineConfig } from "vocs";

import packageJson from "./package.json";

export default defineConfig({
    title: "Cartridge Controller",
    description: "Cartridge | Tools for onchain development",
    iconUrl: "/Cartridge.svg",
    logoUrl: "/Cartridge.svg",
    ogImageUrl:
        "https://og-image.preview.cartridge.gg/api/cartridge?logo=%https://www.dojoengine.org/dojo-icon.svg&title=%title&description=%description",

    theme: {
        colorScheme: "dark",
        variables: {
            color: {
                textAccent: "#ffc52a",
                background: "#0c0c0c",
                backgroundDark: "#121212",
                noteBackground: "#1a1a1a",
            },
        },
    },
    font: {
        google: "Open Sans",
    },
    topNav: [
        {
            text: packageJson.version,
            items: [
                {
                    text: "Releases",
                    link: "https://github.com/cartridge-gg/controller/releases",
                },
                {
                    text: "Changelog",
                    link: "https://github.com/cartridge-gg/controller/releases",
                },
            ],
        },
    ],
    socials: [
        {
            icon: "github",
            link: "https://github.com/cartridge-gg/controller",
        },
        {
            icon: "x",
            link: "https://x.com/cartridge_gg",
        },
    ],
    editLink: {
        pattern:
            "https://github.com/cartridge-gg/controller/blob/main/docs/pages/:path",
        text: "Edit on GitHub",
    },

    // Banner configuration
    banner: {
        dismissable: false,
        backgroundColor: "red",
        content: "Join us in [Discord](https://discord.gg/cartridge)!",
        height: "28px",
        textColor: "white",
    },
    sidebar: [
        {
            text: "Controller",
            items: [
                {
                    text: "Overview",
                    link: "/controller/overview",
                },
                {
                    text: "Getting Started",
                    link: "/controller/getting-started",
                },
                {
                    text: "Sessions",
                    link: "/controller/sessions",
                },
                {
                    text: "Configuration",
                    link: "/controller/configuration",
                },
                {
                    text: "Theming",
                    link: "/controller/theming",
                },
                {
                    text: "Controller Examples",
                    items: [
                        {
                            text: "React",
                            link: "/controller/examples/react",
                        },
                        {
                            text: "Svelte",
                            link: "/controller/examples/svelte",
                        },
                        {
                            text: "Rust",
                            link: "/controller/examples/rust",
                        },
                        {
                            text: "Telegram",
                            link: "/controller/examples/telegram",
                        },
                    ],
                },
            ],
        },
        {
            text: "Slot",
            items: [
                {
                    text: "Getting Started",
                    link: "/slot/getting-started",
                },
            ],
        },
        {
            text: "VRF",
            items: [
                {
                    text: "Overview",
                    link: "/vrf/overview",
                },
            ],
        },
    ],
});
