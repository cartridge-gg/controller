import { EventNode } from "@cartridge/utils/api/indexer";
import { byteArray, shortString } from "starknet";

export interface Task {
  id: string;
  total: number;
  description: string;
}

export class Trophy {
  id: string;
  hidden: boolean;
  index: number;
  earning: number;
  start: number;
  end: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  tasks: Task[];
  data: string;

  constructor(
    id: string,
    hidden: boolean,
    index: number,
    earning: number,
    start: number,
    end: number,
    group: string,
    icon: string,
    title: string,
    description: string,
    tasks: Task[],
    data: string,
  ) {
    this.id = id;
    this.hidden = hidden;
    this.index = index;
    this.earning = earning;
    this.start = start;
    this.end = end;
    this.group = group;
    this.icon = icon;
    this.title = title;
    this.description = description;
    this.tasks = tasks;
    this.data = data;
  }

  static from(node: EventNode): Trophy {
    return Trophy.parse(node);
  }

  static parse(node: EventNode): Trophy {
    try {
      return Trophy.parseV0(node);
    } catch (_e) {
      return Trophy.parseV1(node);
    }
  }

  static parseV1(node: EventNode): Trophy {
    const descriptionIndex = 11;
    const descriptionLength = parseInt(node.data[descriptionIndex]);
    const taskIndex = descriptionIndex + descriptionLength + 3;
    // const tasksLength = parseInt(node.data[taskIndex]);
    const taskDescriptionIndex = taskIndex + 3;
    const taskDescriptionLength = parseInt(node.data[taskDescriptionIndex]);
    return {
      id: shortString.decodeShortString(node.data[1]),
      hidden: !parseInt(node.data[3]) ? false : true,
      index: parseInt(node.data[4]),
      earning: parseInt(node.data[5]),
      start: parseInt(node.data[6]),
      end: parseInt(node.data[7]),
      group: shortString.decodeShortString(node.data[8]),
      icon: shortString.decodeShortString(node.data[9]),
      title: shortString.decodeShortString(node.data[10]),
      description: byteArray.stringFromByteArray({
        data: descriptionLength
          ? node.data.slice(
              descriptionIndex + 1,
              descriptionIndex + 1 + descriptionLength,
            )
          : [],
        pending_word: node.data[descriptionIndex + 1 + descriptionLength],
        pending_word_len: node.data[descriptionIndex + 2 + descriptionLength],
      }),
      tasks: [
        {
          id: shortString.decodeShortString(node.data[taskIndex + 1]),
          total: parseInt(node.data[taskIndex + 2]),
          description: byteArray.stringFromByteArray({
            data: taskDescriptionLength
              ? node.data.slice(
                  taskDescriptionIndex + 1,
                  taskDescriptionIndex + 1 + taskDescriptionLength,
                )
              : [],
            pending_word:
              node.data[taskDescriptionIndex + 1 + taskDescriptionLength],
            pending_word_len:
              node.data[taskDescriptionIndex + 2 + taskDescriptionLength],
          }),
        },
      ],
      data: "",
    };
  }

  static parseV0(node: EventNode): Trophy {
    const descriptionIndex = 9;
    const descriptionLength = parseInt(node.data[descriptionIndex]);
    const taskIndex = descriptionIndex + descriptionLength + 3;
    // const tasksLength = parseInt(node.data[taskIndex]);
    const taskDescriptionIndex = taskIndex + 3;
    const taskDescriptionLength = parseInt(node.data[taskDescriptionIndex]);
    return {
      id: shortString.decodeShortString(node.data[1]),
      hidden: !parseInt(node.data[3]) ? false : true,
      index: parseInt(node.data[4]),
      earning: parseInt(node.data[5]),
      start: 0,
      end: 0,
      group: shortString.decodeShortString(node.data[6]),
      icon: shortString.decodeShortString(node.data[7]),
      title: shortString.decodeShortString(node.data[8]),
      description: byteArray.stringFromByteArray({
        data: descriptionLength
          ? node.data.slice(
              descriptionIndex + 1,
              descriptionIndex + 1 + descriptionLength,
            )
          : [],
        pending_word: node.data[descriptionIndex + 1 + descriptionLength],
        pending_word_len: node.data[descriptionIndex + 2 + descriptionLength],
      }),
      tasks: [
        {
          id: shortString.decodeShortString(node.data[taskIndex + 1]),
          total: parseInt(node.data[taskIndex + 2]),
          description: byteArray.stringFromByteArray({
            data: taskDescriptionLength
              ? node.data.slice(
                  taskDescriptionIndex + 1,
                  taskDescriptionIndex + 1 + taskDescriptionLength,
                )
              : [],
            pending_word:
              node.data[taskDescriptionIndex + 1 + taskDescriptionLength],
            pending_word_len:
              node.data[taskDescriptionIndex + 2 + taskDescriptionLength],
          }),
        },
      ],
      data: "",
    };
  }
}
