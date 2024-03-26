import {
  constants,
  hash,
  stark,
  transaction,
  typedData,
  Abi,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  Account,
  DeclareSignerDetails,
  EstimateFeeDetails,
  EstimateFee,
  InvocationsDetails,
  InvokeFunctionResponse,
  TransactionType,
} from "starknet";
import cbor from "cbor";
import base64url from "base64url";
import { split } from "@cartridge/controller";
import { CLASS_HASHES } from "@cartridge/controller/src/constants";

export type RawAssertion = PublicKeyCredential & {
  response: AuthenticatorAssertionResponse;
};

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

  constructor(
    credentialId: string,
    publicKey: string,
    rpId: string = process.env.NEXT_PUBLIC_RP_ID,
  ) {
    this.credentialId = credentialId;
    this.publicKey = publicKey;
    this.rpId = rpId;
  }

  public async getPubKey(): Promise<string> {
    return this.publicKey;
  }

  public async sign(challenge: BufferSource): Promise<RawAssertion> {
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

  public async signTransaction(
    calls: Call[],
    transactionsDetail: InvocationsSignerDetails & {
      ext?: Buffer;
    },
    abis?: Abi[],
  ): Promise<Signature> {
    if (abis && abis.length !== calls.length) {
      throw new Error(
        "ABI must be provided for each transaction or no transaction",
      );
    }
    // now use abi to display decoded data somewhere, but as this signer is headless, we can't do that

    const calldata = transaction.fromCallsToExecuteCalldata(calls);

    // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
    const msgHash = hash.calculateTransactionHash(
      transactionsDetail.walletAddress,
      transactionsDetail.version,
      calldata,
      // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
      transactionsDetail.maxFee,
      transactionsDetail.chainId,
      transactionsDetail.nonce,
    );

    let challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );

    // if (transactionsDetail.ext) {
    //   challenge = Buffer.concat([challenge, transactionsDetail.ext]);
    // }

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

  public async signDeclareTransaction({
    classHash,
    senderAddress,
    chainId,
    // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
    maxFee,
    version,
    nonce,
  }: DeclareSignerDetails) {
    const msgHash = hash.calculateDeclareTransactionHash(
      classHash,
      // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
      senderAddress,
      version,
      maxFee,
      chainId,
      nonce,
    );

    const challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );

    const assertion = await this.sign(challenge);
    return formatAssertion(assertion);
  }

  public async signDeployAccountTransaction(
    transaction: DeployAccountSignerDetails,
  ): Promise<Signature> {
    return;
  }
}

class WebauthnAccount extends Account {
  // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
  public signer: WebauthnSigner;
  constructor(
    nodeUrl: string,
    address: string,
    credentialId: string,
    publicKey: string,
    options?: {
      rpId?: string;
    },
  ) {
    const signer = new WebauthnSigner(
      credentialId,
      publicKey,
      options ? options.rpId : undefined,
    );
    super({ nodeUrl }, address, signer);
    this.signer = signer;
  }

  async estimateInvokeFee(
    calls: Call[],
    {
      nonce: providedNonce,
      blockIdentifier,
      ext,
    }: EstimateFeeDetails & { ext?: Buffer } = {},
  ): Promise<EstimateFee> {
    const transactions = Array.isArray(calls) ? calls : [calls];
    const nonce = BigInt(providedNonce ?? (await this.getNonce()));
    // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
    const version = hash.transactionVersion;
    const chainId = await this.getChainId();

    const signerDetails = {
      walletAddress: this.address,
      nonce,
      maxFee: constants.ZERO,
      version,
      chainId,
      ext,
    };

    const signature = await this.signer.signTransaction(
      transactions,
      // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
      signerDetails,
    );

    const calldata = transaction.fromCallsToExecuteCalldata(transactions);
    const response = await super.getInvokeEstimateFee(
      { contractAddress: this.address, calldata, signature },
      { version, nonce },
      blockIdentifier,
    );

    const suggestedMaxFee = stark.estimatedFeeToMaxFee(response.overall_fee);

    return {
      ...response,
      suggestedMaxFee,
    };
  }

  async execute(
    calls: Call[],
    abis?: Abi[] | undefined,
    transactionsDetail?: InvocationsDetails & { ext?: Buffer },
  ): Promise<InvokeFunctionResponse> {
    const transactions = Array.isArray(calls) ? calls : [calls];
    const nonce = BigInt(transactionsDetail.nonce ?? (await this.getNonce()));
    const maxFee =
      transactionsDetail.maxFee ??
      // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
      (await this.getSuggestedMaxFee(
        { type: TransactionType.INVOKE, payload: calls },
        transactionsDetail,
      ));
    // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
    const version = BigInt(hash.transactionVersion);
    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      nonce,
      maxFee,
      // @ts-expect-error Note(#244): WebauthnAccount will be deprecated by account-sdk
      version,
      chainId,
    };

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    );

    const calldata = transaction.fromCallsToExecuteCalldata(transactions);

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      {
        nonce,
        maxFee,
        version,
      },
    );
  }
}

export function formatAssertion(assertion: RawAssertion): Signature {
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

  const r = BigInt(
    "0x" + Buffer.from(usignature.slice(rStart, rEnd)).toString("hex"),
  );
  const s = BigInt(
    "0x" + Buffer.from(usignature.slice(sStart)).toString("hex"),
  );

  const { x: r0, y: r1, z: r2 } = split(r);
  const { x: s0, y: s1, z: s2 } = split(s);

  return [
    BigInt(CLASS_HASHES["0.0.1"].controller).toString(),
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

export function parseAuthenticatorData(data) {
  const d =
    data instanceof ArrayBuffer
      ? new DataView(data)
      : new DataView(data.buffer, data.byteOffset, data.byteLength);
  let p = 0;

  const result: any = {};

  result.rpIdHash = "";
  for (const end = p + 32; p < end; ++p) {
    result.rpIdHash += d.getUint8(p).toString(16);
  }

  const flags = d.getUint8(p++);
  result.flags = {
    userPresent: (flags & 0x01) !== 0,
    reserved1: (flags & 0x02) !== 0,
    userVerified: (flags & 0x04) !== 0,
    reserved2: ((flags & 0x38) >>> 3).toString(16),
    attestedCredentialData: (flags & 0x40) !== 0,
    extensionDataIncluded: (flags & 0x80) !== 0,
  };

  result.signCount = d.getUint32(p, false);
  p += 4;

  if (result.flags.attestedCredentialData) {
    const atCredData: any = {};
    result.attestedCredentialData = atCredData;

    atCredData.aaguid = "";
    for (const end = p + 16; p < end; ++p) {
      atCredData.aaguid += d.getUint8(p).toString(16);
    }

    atCredData.credentialIdLength = d.getUint16(p, false);
    p += 2;

    atCredData.credentialId = "";
    for (const end = p + atCredData.credentialIdLength; p < end; ++p) {
      atCredData.credentialId += d.getUint8(p).toString(16);
    }

    try {
      const encodedCred = Buffer.from(d.buffer, d.byteOffset + p);
      atCredData.credentialPublicKey = cbor.decodeAllSync(encodedCred)[0];
    } catch (e) {
      console.error("Failed to decode CBOR data: ", e);

      atCredData.credentialPublicKey = `Decode error: ${e.toString()}`;
    }
  }

  if (result.flags.extensionDataIncluded) {
    // TODO
  }

  return result;
}

export function parseAttestationObject(data) {
  const buffer =
    data instanceof ArrayBuffer
      ? Buffer.from(data)
      : Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  try {
    const decoded = cbor.decodeAllSync(buffer)[0];
    if (decoded.authData) {
      decoded.authData = parseAuthenticatorData(decoded.authData);
    }

    const publicKeyCbor =
      decoded.authData.attestedCredentialData.credentialPublicKey;

    const x = BigInt("0x" + publicKeyCbor.get(-2).toString("hex"));
    const y = BigInt("0x" + publicKeyCbor.get(-3).toString("hex"));

    return { ...decoded, pub: { x, y } };
  } catch (e) {
    const msg = "Failed to decode attestationObject, unknown attestation type?";
    console.error(msg);
    return msg;
  }
}

export default WebauthnAccount;
