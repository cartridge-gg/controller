import { EventNode } from "@cartridge/utils/api/indexer";
import { Reader } from ".";

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
    } catch {
      return Trophy.parseV1(node);
    }
  }

  static parseV1(node: EventNode): Trophy {
    const reader = new TrophyReader(node);
    return {
      id: reader.popId(),
      hidden: reader.popHidden(),
      index: reader.popIndex(),
      earning: reader.popEarning(),
      start: reader.popNumber(),
      end: reader.popNumber(),
      group: reader.popString(),
      icon: reader.popString(),
      title: reader.popString(),
      description: reader.popByteArray(),
      tasks: reader.popTasks(),
      data: "",
    };
  }

  static parseV0(node: EventNode): Trophy {
    const reader = new TrophyReader(node);
    return {
      id: reader.popId(),
      hidden: reader.popHidden(),
      index: reader.popIndex(),
      earning: reader.popEarning(),
      start: 0,
      end: 0,
      group: reader.popGroup(),
      icon: reader.popIcon(),
      title: reader.popTitle(),
      description: reader.popDescription(),
      tasks: reader.popTasks(),
      data: "",
    };
  }
}

class TrophyReader extends Reader {
  constructor(node: EventNode) {
    super(node);
  }

  popId(): string {
    return this.popString(2);
  }

  popHidden(): boolean {
    return !this.popBoolean();
  }

  popIndex(): number {
    return this.popNumber();
  }

  popEarning(): number {
    return this.popNumber();
  }

  popGroup(): string {
    return this.popString();
  }

  popIcon(): string {
    return this.popString();
  }

  popTitle(): string {
    return this.popString();
  }

  popDescription(): string {
    return this.popByteArray();
  }

  popTasks(): Task[] {
    const tasks = [];
    const length = this.popNumber();
    for (let i = 0; i < length; i++) {
      tasks.push(this.popTask());
    }
    return tasks;
  }

  popTask(): Task {
    const id = this.popString();
    const total = this.popNumber();
    const description = this.popDescription();
    return { id, total, description };
  }
}
