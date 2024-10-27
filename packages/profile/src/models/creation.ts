import { EventNode } from "@cartridge/utils/api/indexer";
import { byteArray, shortString } from "starknet";

export class Creation {
  id: string;
  quest: string;
  title: string;
  description: string;
  earning: number;
  hidden: boolean;
  total: number;
  icon: string;
  timestamp: number;

  constructor(
    id: string,
    quest: string,
    title: string,
    description: string,
    earning: number,
    hidden: boolean,
    total: number,
    icon: string,
    timestamp: number,
  ) {
    this.id = id;
    this.quest = quest;
    this.title = title;
    this.description = description;
    this.earning = earning;
    this.hidden = hidden;
    this.total = total;
    this.icon = icon;
    this.timestamp = timestamp;
  }

  static from(node: EventNode): Creation {
    return Creation.parse(node);
  }

  static parse(node: EventNode): Creation {
    const length = parseInt(node.data[5]);
    const data = node.data.slice(6, 6 + length);
    return {
      id: shortString.decodeShortString(node.keys[1]),
      quest: shortString.decodeShortString(node.data[0]),
      hidden: !parseInt(node.data[1]) ? false : true,
      earning: parseInt(node.data[2]),
      total: parseInt(node.data[3]),
      title: shortString.decodeShortString(node.data[4]),
      description: byteArray.stringFromByteArray({
        data: data,
        pending_word: node.data[6 + length],
        pending_word_len: node.data[7 + length],
      }),
      icon: shortString.decodeShortString(node.data[8 + length]),
      timestamp: parseInt(node.data[9 + length]),
    };
  }
}
