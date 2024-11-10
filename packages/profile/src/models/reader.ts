import { EventNode } from "@cartridge/utils/api/indexer";
import { byteArray, shortString } from "starknet";

export class Reader {
  node: EventNode;
  cursor: number;

  constructor(node: EventNode) {
    this.node = node;
    this.cursor = 1;
  }

  popValue(shift = 1): string {
    const value = this.node.data[this.cursor];
    this.cursor += shift;
    return value;
  }

  popNumber(shift = 1): number {
    return parseInt(this.popValue(shift));
  }

  popBoolean(shift = 1): boolean {
    const value = this.popValue(shift);
    return parseInt(value) ? false : true;
  }

  popString(shift = 1): string {
    const value = this.popValue(shift);
    return shortString.decodeShortString(value);
  }

  popByteArray(shift = 1): string {
    const length = this.popNumber();
    const value = byteArray.stringFromByteArray({
      data: length
        ? this.node.data.slice(this.cursor, this.cursor + length)
        : [],
      pending_word: this.node.data[this.cursor + length],
      pending_word_len: this.node.data[this.cursor + length + 1],
    });
    this.cursor += length + 1 + shift;
    return value;
  }
}
