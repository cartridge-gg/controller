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
    const descriptionIndex = 6;
    const descriptionLength = parseInt(node.data[descriptionIndex]);
    const taskIndex =
      8 + (descriptionLength ? descriptionLength + 1 : descriptionLength);
    // const tasksLength = parseInt(node.data[taskIndex]);
    const taskDescriptionIndex = taskIndex + 3;
    const taskDescriptionLength = parseInt(node.data[taskDescriptionIndex]);
    return {
      id: shortString.decodeShortString(node.keys[1]),
      hidden: !parseInt(node.data[0]) ? false : true,
      index: parseInt(node.data[1]),
      earning: parseInt(node.data[2]),
      group: shortString.decodeShortString(node.data[3]),
      icon: shortString.decodeShortString(node.data[4]),
      title: shortString.decodeShortString(node.data[5]),
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
