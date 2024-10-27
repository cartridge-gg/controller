import { EventNode } from "@cartridge/utils/api/indexer";
import { shortString } from "starknet";

export class Completion {
  player: string;
  quest: string;
  count: number;
  timestamp: number;

  constructor(player: string, quest: string, count: number, timestamp: number) {
    this.player = player;
    this.quest = quest;
    this.count = count;
    this.timestamp = timestamp;
  }

  static from(node: EventNode): Completion {
    return Completion.parse(node);
  }

  static parse(node: EventNode): Completion {
    return {
      player: node.keys[1],
      quest: shortString.decodeShortString(node.keys[2]),
      count: parseInt(node.data[0]),
      timestamp: parseInt(node.data[1]),
    };
  }
}
