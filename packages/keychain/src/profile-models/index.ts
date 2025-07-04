import { ByteArray, byteArray, hash } from "starknet";

export * from "./trophy";
export * from "./progress";

// Computes dojo selector from namespace and event name
export function getSelectorFromTag(namespace: string, event: string): string {
  return hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
}

// Poseidon hash of a string representated as a ByteArray
export function computeByteArrayHash(str: string): string {
  const bytes = byteArray.byteArrayFromString(str);
  return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
}

// Serializes a ByteArray to a bigint array
export function serializeByteArray(byteArray: ByteArray): bigint[] {
  const result: bigint[] = [
    BigInt(byteArray.data.length),
    ...byteArray.data.map((word) => BigInt(word.toString())),
    BigInt(byteArray.pending_word),
    BigInt(byteArray.pending_word_len),
  ];
  return result;
}
