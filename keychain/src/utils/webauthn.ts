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
  DeclareSignerDetails,
  EstimateFeeDetails,
  EstimateFee,
  InvocationsDetails,
  InvokeFunctionResponse,
} from "starknet";
import base64url from "base64url";
import { split } from "@cartridge/controller";
import { calculateDeclareTransactionHash } from "starknet/dist/utils/hash";
import { toBN } from "starknet/utils/number";
import { transactionVersion } from "starknet/utils/hash";
import { ZERO } from "starknet/constants";
import { fromCallsToExecuteCalldata } from "starknet/utils/transaction";
import { estimatedFeeToMaxFee } from "starknet/dist/utils/stark";

type RawAssertion = PublicKeyCredential & {
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
    rpId: string = "cartridge.gg",
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

    const msgHash = hash.calculateTransactionHash(
      transactionsDetail.walletAddress,
      transactionsDetail.version,
      calldata,
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
    maxFee,
    version,
    nonce,
  }: DeclareSignerDetails) {
    const msgHash = calculateDeclareTransactionHash(
      classHash,
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
  public signer: WebauthnSigner;
  constructor(
    address: string,
    credentialId: string,
    publicKey: string,
    options: {
      rpId?: string;
    },
  ) {
    const signer = new WebauthnSigner(credentialId, publicKey, options.rpId);
    super(defaultProvider, address, signer);
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
    const nonce = toBN(providedNonce ?? (await this.getNonce()));
    const version = toBN(transactionVersion);
    const chainId = await this.getChainId();

    const signerDetails = {
      walletAddress: this.address,
      nonce,
      maxFee: ZERO,
      version,
      chainId,
      ext,
    };

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
    );

    const calldata = fromCallsToExecuteCalldata(transactions);
    const response = await super.getInvokeEstimateFee(
      { contractAddress: this.address, calldata, signature },
      { version, nonce },
      blockIdentifier,
    );

    const suggestedMaxFee = estimatedFeeToMaxFee(response.overall_fee);

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
    const nonce = toBN(transactionsDetail.nonce ?? (await this.getNonce()));
    const maxFee =
      transactionsDetail.maxFee ??
      (await this.getSuggestedMaxFee(
        { type: "INVOKE", payload: calls },
        transactionsDetail,
      ));
    const version = toBN(transactionVersion);
    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      nonce,
      maxFee,
      version,
      chainId,
    };

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    );

    const calldata = fromCallsToExecuteCalldata(transactions);

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
