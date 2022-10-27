import {
  Abi,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  transaction,
  hash,
  typedData,
  number,
  Account,
  defaultProvider,
  DeclareSignerDetails
} from "starknet";
import base64url from "base64url";
import { Assertion, split } from "@cartridge/controller";
import { calculateDeclareTransactionHash } from "starknet/dist/utils/hash";

function convertUint8ArrayToWordArray(u8Array: Uint8Array) {
  var words = [],
    i = 0,
    len = u8Array.length;

  while (i < len) {
    words.push(
      ((u8Array[i++] << 24) |
        (u8Array[i++] << 16) |
        (u8Array[i++] << 8) |
        u8Array[i++]) >>>
      0,
    );
  }

  return {
    sigBytes: words.length * 4,
    words: words,
  };
}

export class WebauthnSigner implements SignerInterface {
  private credentialId: string;
  private publicKey: string;
  private rpId: string;

  constructor(credentialId: string, publicKey: string, rpId: string = "cartridge.gg") {
    this.credentialId = credentialId;
    this.publicKey = publicKey;
    this.rpId = rpId;
  }

  public async getPubKey(): Promise<string> {
    return this.publicKey;
  }

  public async sign(challenge: BufferSource): Promise<Assertion> {
    return (await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        rpId: this.rpId,
        allowCredentials: [
          {
            type: "public-key",
            id: base64url.toBuffer(this.credentialId),
          },
        ],
        userVerification: "required",
      },
    })) as unknown as PublicKeyCredential & {
      response: AuthenticatorAssertionResponse;
    };
  }

  public hashTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): string {
    if (abis && abis.length !== transactions.length) {
      throw new Error(
        "ABI must be provided for each transaction or no transaction",
      );
    }
    // now use abi to display decoded data somewhere, but as this signer is headless, we can't do that

    const calldata = transaction.fromCallsToExecuteCalldataWithNonce(
      transactions,
      transactionsDetail.nonce,
    );

    return hash.calculateTransactionHash(
      transactionsDetail.walletAddress,
      transactionsDetail.version,
      [hash.getSelectorFromName("__execute__")].concat(calldata),
      transactionsDetail.maxFee,
      transactionsDetail.chainId,
      transactionsDetail.nonce,
    );
  }

  public async signTransaction(
    calls: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    if (abis && abis.length !== calls.length) {
      throw new Error(
        "ABI must be provided for each transaction or no transaction",
      );
    }
    // now use abi to display decoded data somewhere, but as this signer is headless, we can't do that

    const calldata = transaction.fromCallsToExecuteCalldataWithNonce(
      calls,
      transactionsDetail.nonce,
    );

    const msgHash = hash.calculateTransactionHash(
      transactionsDetail.walletAddress,
      transactionsDetail.version,
      [hash.getSelectorFromName("__execute__")].concat(calldata),
      transactionsDetail.maxFee,
      transactionsDetail.chainId,
      transactionsDetail.nonce,
    );

    const challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );
    const assertion = await this.sign(challenge);
    return formatAssertion(assertion);
  }

  public async signMessage(
    td: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const msgHash = typedData.getMessageHash(td, accountAddress);
    const challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );
    const assertion = await this.sign(challenge);
    return formatAssertion(assertion);
  }

  public async signDeclareTransaction(
    // contractClass: ContractClass,  // Should be used once class hash is present in ContractClass
    { classHash, senderAddress, chainId, maxFee, version, nonce }: DeclareSignerDetails
  ) {
    const msgHash = calculateDeclareTransactionHash(
      classHash,
      senderAddress,
      version,
      maxFee,
      chainId,
      nonce
    );

    const challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );
    const assertion = await this.sign(challenge);
    return formatAssertion(assertion);
  }

  public async signDeployAccountTransaction(transaction: DeployAccountSignerDetails): Promise<Signature> {
    return;
  }
}

class WebauthnAccount extends Account {
  public signer: WebauthnSigner;
  constructor(
    address: string, credentialId: string, publicKey: string, options: {
      rpId?: string
    }) {
    const signer = new WebauthnSigner(credentialId, publicKey, options.rpId);
    super(defaultProvider, address, signer);
    this.signer = signer;
  }
}

export function formatAssertion(assertion: Assertion): Signature {
  var authenticatorDataBytes = new Uint8Array(
    assertion.response.authenticatorData,
  );

  let authenticatorDataRem = 4 - (authenticatorDataBytes.length % 4);
  if (authenticatorDataRem == 4) {
    authenticatorDataRem = 0;
  }
  const authenticatorDataWords = convertUint8ArrayToWordArray(
    authenticatorDataBytes,
  ).words;

  var clientDataJSONBytes = new Uint8Array(assertion.response.clientDataJSON);
  let clientDataJSONRem = 4 - (clientDataJSONBytes.length % 4);
  if (clientDataJSONRem == 4) {
    clientDataJSONRem = 0;
  }
  const clientDataWords =
    convertUint8ArrayToWordArray(clientDataJSONBytes).words;

  // Convert signature from ASN.1 sequence to "raw" format
  const usignature = new Uint8Array(assertion.response.signature);
  const rStart = usignature[4] === 0 ? 5 : 4;
  const rEnd = rStart + 32;
  const sStart = usignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;

  const r = number.toBN(
    "0x" + Buffer.from(usignature.slice(rStart, rEnd)).toString("hex"),
  );
  const s = number.toBN(
    "0x" + Buffer.from(usignature.slice(sStart)).toString("hex"),
  );

  const { x: r0, y: r1, z: r2 } = split(r);
  const { x: s0, y: s1, z: s2 } = split(s);

  return [
    "3364130956791496674817841690353332031228403084330511699766716352059223014607",
    "0",
    r0.toString(),
    r1.toString(),
    r2.toString(),
    s0.toString(),
    s1.toString(),
    s2.toString(),
    "9",
    "0",
    `${clientDataWords.length}`,
    `${clientDataJSONRem}`,
    ...clientDataWords.map((word) => `${word}`),
    `${authenticatorDataWords.length}`,
    `${authenticatorDataRem}`,
    ...authenticatorDataWords.map((word) => `${word}`),
  ];
}

export default WebauthnAccount;