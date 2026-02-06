import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "gg.cartridge.controller.capacitor",
  appName: "Cartridge Session",
  webDir: "dist",
  server: {
    hostname: "controller-capacitor", // Recommended: Set a custom hostname for production
    androidScheme: "https",
    iosScheme: "capacitor",
  },
};

export default config;
