import Controller from "@/utils/controller";

export const addWebauthnSigner = async (controller: Controller | undefined) => {
  const username = controller?.username();
  if (!controller || !username) {
    throw new Error("Username not found");
  }
  await controller.addOwner(
    {
      webauthn: {
        rpId: import.meta.env.VITE_RP_ID,
        credentialId: "",
        publicKey: JSON.stringify({}),
      },
    },
    {
      type: "webauthn",
      credential: "",
    },
  );
};
