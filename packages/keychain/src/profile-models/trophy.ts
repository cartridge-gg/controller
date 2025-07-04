import { shortString } from "starknet";

export interface RawTrophy {
  id: string;
  hidden: number;
  page: number;
  points: number;
  start: string;
  end: string;
  achievementGroup: string;
  icon: string;
  title: string;
  description: string;
  taskId: string;
  taskTotal: number;
  taskDescription: string;
  data: string;
}

export interface Task {
  id: string;
  total: number;
  description: string;
}

export class Trophy {
  key: string;
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
    key: string,
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
    this.key = key;
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

  static from(node: RawTrophy): Trophy {
    return Trophy.parse(node);
  }

  static parse(node: RawTrophy): Trophy {
    return {
      key: `${node.id}-${node.taskId}`,
      id: node.id,
      hidden: node.hidden === 1,
      index: node.page,
      earning: node.points,
      start: node.start === "0x" ? 0 : parseInt(node.start),
      end: node.end === "0x" ? 0 : parseInt(node.end),
      group: shortString.decodeShortString(node.achievementGroup),
      icon: shortString.decodeShortString(node.icon),
      title: shortString.decodeShortString(node.title),
      description: node.description,
      tasks: [
        {
          id: node.taskId,
          total: node.taskTotal,
          description: node.taskDescription,
        },
      ],
      data: node.data,
    };
  }
}
