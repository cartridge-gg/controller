import { Web3AuthCore } from "@web3auth/core";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const clientId =
  "BKpRo2vJuxbHH3giMVQfdts2l1P3D51AB5hIZ_-HNfkfisVV94Q4aQcZbjXjduwZW8j6n1TlBaEl6Q1nOQXRCG0";

const web3auth = new Web3AuthCore({
  clientId,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.OTHER,
  },
  web3AuthNetwork: "cyan",
});

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    loginConfig: {
      discord: {
        verifier: "cartridge-discord",
        typeOfLogin: "discord",
        clientId: "993873951828754434",
      },
    },
  },
});

web3auth.configureAdapter(openloginAdapter);
web3auth.init();
export default web3auth;
