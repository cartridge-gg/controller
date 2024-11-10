import { EventNode } from "@cartridge/utils/api/indexer";
import { Reader } from "./reader";

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
    const reader = new ProgressReader(node);
    return {
      player: reader.popPlayer(),
      task: reader.popTask(),
      count: reader.popCount(),
      timestamp: reader.popTimestamp(),
    };
  }
}

class ProgressReader extends Reader {
  constructor(node: EventNode) {
    super(node);
  }

  popPlayer(): string {
    return this.popValue();
  }

  popTask(): string {
    return this.popString(2);
  }

  popCount(): number {
    return this.popNumber();
  }

  popTimestamp(): number {
    return this.popNumber();
  }
}
