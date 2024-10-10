import { shortString } from "starknet";

export class ERC721 {
  private address: string;
  // private provider: Provider;

  constructor({
    address,
  }: // provider
  {
    address: string;
    // provider: Provider
  }) {
    this.address = address;
    //   this.provdier = provider;
  }

  async tokenUriToJson(result: string[]): Promise<Record<string, any>> {
    const dataUri = result.map(shortString.decodeShortString).join("");
    switch (this.address) {
      // impl contract specific logic here if necessary
      // Starknet.id
      case "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af": {
        const url = new URL(
          result.slice(1, -1).map(shortString.decodeShortString).join(""),
        );
        const res = await fetch(url);
        return res.json();
      }
      // Realms: Loot Survivor
      case "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4": {
        break;
      }
      default: {
        if (dataUri.includes("data:application/json;base64,")) {
          const [, encodedData] = dataUri.split(",");
          const decodedData = atob(encodedData);
          return JSON.parse(decodedData);
        }
        if (
          dataUri.includes("data:application/json;utf8,") ||
          dataUri.includes("data:application/json,")
        ) {
          const data = dataUri.split(",").slice(1).join(",");
          return JSON.parse(data);
        }
      }
    }

    throw new Error(`Unsupported data URI format: ${dataUri}`);
  }
}
