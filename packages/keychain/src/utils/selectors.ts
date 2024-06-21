const selectors = {
  // FIXME: there's a build error if we use the VERSION constant here
  ["0.0.3"]: {
    active: () => `@cartridge/active`,
    account: (address: string) => `@cartridge/account/${address}`,
    deployment: (address: string, chainId: string) =>
      `@cartridge/deployment/${address}/${chainId}`,
    admin: (address: string, origin: string) =>
      `@cartridge/admin/${address}/${origin}`,
    session: (address: string, origin: string, chainId: string) =>
      `@cartridge/session/${address}/${origin}/${chainId}`,
  },
};

export default selectors;
