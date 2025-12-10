import { getChecksumAddress, shortString } from "starknet";

export const QUEST_DEFINITION = "QuestDefinition";
export const QUEST_COMPLETION = "QuestCompletion";
export const QUEST_ADVANCEMENT = "QuestAdvancement";
export const QUEST_ASSOCIATION = "QuestAssociation";
export const QUEST_CONDITION = "QuestCondition";
export const QUEST_CREATION = "QuestCreation";
export const QUEST_PROGRESSION = "QuestProgression";
export const QUEST_UNLOCKED = "QuestUnlocked";
export const QUEST_COMPLETED = "QuestCompleted";
export const QUEST_CLAIMED = "QuestClaimed";

export interface RawReward {
  name: string;
  description: string;
  icon: string;
}

export interface RawUnlocked {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawCompleted {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawClaimed {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawMetadata {
  name: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  icon: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  rewards: {
    type: "array";
    type_name: "Array<QuestReward>";
    value: {
      type: "struct";
      type_name: "QuestReward";
      value: RawReward;
      key: boolean;
    }[];
    key: boolean;
  };
}

export interface RawCreation {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  definition: {
    type: "struct";
    type_name: "QuestDefinition";
    value: RawDefinition;
    key: boolean;
  };
  metadata: {
    type: "struct";
    type_name: "QuestMetadata";
    value: string;
    key: boolean;
  };
}

export interface RawProgression {
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
}

export interface RawCondition {
  quests: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
}

export interface RawAssociation {
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quests: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
}

export interface RawAdvancement {
  count: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawCompletion {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  unclaimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  lock_count: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
}

export interface RawDefinition {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  conditions: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
  end: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  tasks: {
    type: "array";
    type_name: "Array<Task>";
    value: {
      type: "struct";
      type_name: "Task";
      value: RawTask;
      key: boolean;
    }[];
    key: boolean;
  };
  start: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  rewarder: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  duration: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawTask {
  total: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
}

export class QuestTask {
  id: string;
  description: string;
  total: bigint;

  constructor(id: string, description: string, total: bigint) {
    this.id = shortString.decodeShortString(`0x${BigInt(id).toString(16)}`);
    this.description = description;
    this.total = BigInt(total);
  }

  static from(data: RawTask): QuestTask {
    return QuestTask.parse(data);
  }

  static parse(data: RawTask): QuestTask {
    return new QuestTask(
      data.id.value,
      data.description.value,
      BigInt(data.total.value),
    );
  }
}

export class QuestDefinition {
  id: string;
  rewarder: string;
  start: number;
  end: number;
  duration: number;
  interval: number;
  tasks: QuestTask[];
  conditions: string[];

  constructor(
    id: string,
    rewarder: string,
    start: number,
    end: number,
    duration: number,
    interval: number,
    tasks: QuestTask[],
    conditions: string[],
  ) {
    this.id = id;
    this.rewarder = rewarder;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.interval = interval;
    this.tasks = tasks;
    this.conditions = conditions;
  }

  static from(data: RawDefinition): QuestDefinition {
    return QuestDefinition.parse(data);
  }

  static parse(data: RawDefinition): QuestDefinition {
    const props = {
      id: shortString.decodeShortString(
        `0x${BigInt(data.id.value).toString(16)}`,
      ),
      rewarder: getChecksumAddress(
        `0x${BigInt(data.rewarder.value).toString(16)}`,
      ),
      start: parseInt(data.start.value),
      end: parseInt(data.end.value),
      duration: parseInt(data.duration.value),
      interval: parseInt(data.interval.value),
      tasks: data.tasks.value.map((task) => QuestTask.parse(task.value)),
      conditions: data.conditions.value.map((condition) =>
        shortString.decodeShortString(
          `0x${BigInt(condition.value).toString(16)}`,
        ),
      ),
    };
    return new QuestDefinition(
      props.id,
      props.rewarder,
      props.start,
      props.end,
      props.duration,
      props.interval,
      props.tasks,
      props.conditions,
    );
  }

  static deduplicate(items: QuestDefinition[]): QuestDefinition[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }

  static now(): number {
    return Math.floor(new Date().getTime() / 1000);
  }

  hasStarted(): boolean {
    const now = QuestDefinition.now();
    return this.start === 0 || (now >= this.start && this.start !== 0);
  }

  hasEnded(): boolean {
    const now = QuestDefinition.now();
    return now >= this.end && this.end != 0;
  }

  isActive(): boolean {
    if (!this.hasStarted() || this.hasEnded()) return false;
    if (this.interval == 0) return true;
    const now = QuestDefinition.now();
    return (now - this.start) % this.interval < this.duration;
  }

  getIntervalId(): number | undefined {
    if (!this.isActive()) return undefined;
    if (this.interval === 0 || this.duration === 0) return 0;
    const now = QuestDefinition.now();
    return Math.floor((now - this.start) / this.interval);
  }

  getNextEnd(): number | undefined {
    if (!this.isActive()) return undefined;
    const intervalId = this.getIntervalId();
    if (intervalId === undefined) return undefined;
    return this.start + intervalId * this.interval + this.duration;
  }
}

export class QuestCompletion {
  player_id: string;
  quest_id: string;
  interval_id: number;
  timestamp: number;
  unclaimed: boolean;
  lock_count: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    timestamp: number,
    unclaimed: boolean,
    lock_count: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.timestamp = timestamp;
    this.unclaimed = unclaimed;
    this.lock_count = lock_count;
  }

  static from(data: RawCompletion): QuestCompletion {
    return QuestCompletion.parse(data);
  }

  static parse(data: RawCompletion): QuestCompletion {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      interval_id: parseInt(data.interval_id.value),
      timestamp: parseInt(data.timestamp.value),
      unclaimed: data.unclaimed.value,
      lock_count: parseInt(data.lock_count.value),
    };
    return new QuestCompletion(
      props.player_id,
      props.quest_id,
      props.interval_id,
      props.timestamp,
      props.unclaimed,
      props.lock_count,
    );
  }

  static deduplicate(items: QuestCompletion[]): QuestCompletion[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestAdvancement {
  player_id: string;
  quest_id: string;
  task_id: string;
  interval_id: number;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    quest_id: string,
    task_id: string,
    interval_id: number,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.task_id = task_id;
    this.interval_id = interval_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static from(data: RawAdvancement): QuestAdvancement {
    return QuestAdvancement.parse(data);
  }

  static parse(data: RawAdvancement): QuestAdvancement {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      interval_id: parseInt(data.interval_id.value),
      timestamp: parseInt(data.timestamp.value),
      count: BigInt(data.count.value),
    };
    return new QuestAdvancement(
      props.player_id,
      props.quest_id,
      props.task_id,
      props.interval_id,
      props.timestamp,
      props.count,
    );
  }

  static deduplicate(items: QuestAdvancement[]): QuestAdvancement[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.task_id === item.task_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestAssociation {
  task_id: string;
  quests: string[];

  constructor(task_id: string, quests: string[]) {
    this.task_id = task_id;
    this.quests = quests;
  }

  static from(data: RawAssociation): QuestAssociation {
    return QuestAssociation.parse(data);
  }

  static parse(data: RawAssociation): QuestAssociation {
    const props = {
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      quests: data.quests.value.map((quest) =>
        shortString.decodeShortString(`0x${BigInt(quest.value).toString(16)}`),
      ),
    };
    return new QuestAssociation(props.task_id, props.quests);
  }

  static deduplicate(items: QuestAssociation[]): QuestAssociation[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.task_id === item.task_id),
    );
  }
}

export class QuestCondition {
  quest_id: string;
  quests: string[];

  constructor(quest_id: string, quests: string[]) {
    this.quest_id = quest_id;
    this.quests = quests;
  }

  static from(data: RawCondition): QuestCondition {
    return QuestCondition.parse(data);
  }

  static parse(data: RawCondition): QuestCondition {
    const props = {
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      quests: data.quests.value.map((quest) =>
        shortString.decodeShortString(`0x${BigInt(quest.value).toString(16)}`),
      ),
    };
    return new QuestCondition(props.quest_id, props.quests);
  }

  static deduplicate(items: QuestCondition[]): QuestCondition[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.quest_id === item.quest_id),
    );
  }
}

export class QuestCreation {
  id: string;
  definition: QuestDefinition;
  metadata: QuestMetadata;

  constructor(
    id: string,
    definition: QuestDefinition,
    metadata: QuestMetadata,
  ) {
    this.id = id;
    this.definition = definition;
    this.metadata = metadata;
  }

  static from(data: RawCreation): QuestCreation {
    return QuestCreation.parse(data);
  }

  static parse(data: RawCreation): QuestCreation {
    const props = {
      id: shortString.decodeShortString(
        `0x${BigInt(data.id.value).toString(16)}`,
      ),
      definition: QuestDefinition.parse(data.definition.value),
      metadata: QuestMetadata.parse(data.metadata.value),
    };
    return new QuestCreation(props.id, props.definition, props.metadata);
  }

  static deduplicate(items: QuestCreation[]): QuestCreation[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

export class QuestProgression {
  player_id: string;
  task_id: string;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    task_id: string,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.task_id = task_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static from(data: RawProgression): QuestProgression {
    return QuestProgression.parse(data);
  }

  static parse(data: RawProgression): QuestProgression {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      timestamp: parseInt(data.time.value),
      count: BigInt(data.count.value),
    };
    return new QuestProgression(
      props.player_id,
      props.task_id,
      props.timestamp,
      props.count,
    );
  }

  static deduplicate(items: QuestProgression[]): QuestProgression[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.player_id === item.player_id && t.task_id === item.task_id,
        ),
    );
  }
}

export class QuestReward {
  name: string;
  description: string;
  icon: string;

  constructor(name: string, description: string, icon: string) {
    this.name = name;
    this.description = description;
    this.icon = icon;
  }

  static from(data: RawReward): QuestReward {
    return QuestReward.parse(data);
  }

  static parse(data: RawReward): QuestReward {
    const props = {
      name: data.name,
      description: data.description,
      icon: data.icon,
    };
    return new QuestReward(props.name, props.description, props.icon);
  }

  static deduplicate(items: QuestReward[]): QuestReward[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.name === item.name &&
            t.description === item.description &&
            t.icon === item.icon,
        ),
    );
  }
}

export class QuestMetadata {
  name: string;
  description: string;
  icon: string;
  registry: string;
  rewards: QuestReward[];

  constructor(
    name: string,
    description: string,
    icon: string,
    registry: string,
    rewards: QuestReward[],
  ) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.registry = registry;
    this.rewards = rewards;
  }

  static from(data: string): QuestMetadata {
    return QuestMetadata.parse(data);
  }

  static parse(data: string): QuestMetadata {
    try {
      const object = JSON.parse(data);
      const props = {
        name: object.name,
        description: object.description,
        icon: object.icon,
        registry: getChecksumAddress(
          `0x${BigInt(object.registry).toString(16)}`,
        ),
        rewards: object.rewards.map((reward: RawReward) =>
          QuestReward.parse(reward),
        ),
      };
      return new QuestMetadata(
        props.name,
        props.description,
        props.icon,
        props.registry,
        props.rewards,
      );
    } catch (error) {
      console.error("Failed to parse QuestMetadata:", error);
      return new QuestMetadata("", "", "", "", []);
    }
  }

  static deduplicate(items: QuestMetadata[]): QuestMetadata[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.name === item.name &&
            t.description === item.description &&
            t.icon === item.icon,
        ),
    );
  }
}

export class QuestUnlocked {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static from(data: RawUnlocked): QuestUnlocked {
    return QuestUnlocked.parse(data);
  }

  static parse(data: RawUnlocked): QuestUnlocked {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      interval_id: parseInt(data.interval_id.value),
      time: parseInt(data.time.value),
    };
    return new QuestUnlocked(
      props.player_id,
      props.quest_id,
      props.interval_id,
      props.time,
    );
  }

  static deduplicate(items: QuestUnlocked[]): QuestUnlocked[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestCompleted {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static from(data: RawCompleted): QuestCompleted {
    return QuestCompleted.parse(data);
  }

  static parse(data: RawCompleted): QuestCompleted {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      interval_id: parseInt(data.interval_id.value),
      time: parseInt(data.time.value),
    };
    return new QuestCompleted(
      props.player_id,
      props.quest_id,
      props.interval_id,
      props.time,
    );
  }

  static deduplicate(items: QuestCompleted[]): QuestCompleted[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestClaimed {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static from(data: RawClaimed): QuestClaimed {
    return QuestClaimed.parse(data);
  }

  static parse(data: RawClaimed): QuestClaimed {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      quest_id: shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      interval_id: parseInt(data.interval_id.value),
      time: parseInt(data.time.value),
    };
    return new QuestClaimed(
      props.player_id,
      props.quest_id,
      props.interval_id,
      props.time,
    );
  }

  static deduplicate(items: QuestClaimed[]): QuestClaimed[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}
