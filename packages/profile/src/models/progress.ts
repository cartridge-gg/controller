import { EventNode } from "@cartridge/utils/api/indexer";
import { shortString } from "starknet";

export class Progress {
  player: string;
  task: string;
  count: number;
  timestamp: number;

  constructor(player: string, task: string, count: number, timestamp: number) {
    this.player = player;
    this.task = task;
    this.count = count;
    this.timestamp = timestamp;
  }

  static from(node: EventNode): Progress {
    return Progress.parse(node);
  }

  static parse(node: EventNode): Progress {
    return {
      player: node.keys[1],
      task: shortString.decodeShortString(node.keys[2]),
      count: parseInt(node.data[0]),
      timestamp: parseInt(node.data[1]),
    };
  }
}
