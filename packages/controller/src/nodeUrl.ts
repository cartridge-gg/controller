const nodeUrl = {
  mainnet:
    process.env.NODE_ENV === "production"
      ? "https://api.cartridge.gg/x/starknet/mainnet"
      : "http://localhost:8000/x/starknet/mainnet",
  sepolia:
    process.env.NODE_ENV === "production"
      ? "https://api.cartridge.gg/x/starknet/sepolia"
      : "http://localhost:8000/x/starknet/sepolia",
};

export default nodeUrl;
