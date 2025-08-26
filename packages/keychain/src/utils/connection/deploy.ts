import { ConnectError } from "@cartridge/controller";
import { generateCallbackId, storeCallbacks } from "./callbacks";

export interface DeployParams {
  id?: string;
  account: string;
}

export function deployFactory(navigate: (path: string) => void) {
  return (account: string): Promise<void | ConnectError> => {
    return new Promise((resolve, reject) => {
      const id = generateCallbackId();
      const params: DeployParams = { id, account };

      // Store callbacks for retrieval by the route component
      storeCallbacks(id, { resolve, reject });

      // Navigate to deploy route with data in URL params
      const searchParams = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(params)),
      });
      navigate(`/deploy?${searchParams.toString()}`);
    });
  };
}
