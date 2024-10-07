import type { GuildMember } from "discord.js";

import { Firebase } from "../firebase.js";
import { random, toSeconds } from "../utility.js";

export enum BoosterType {
  Experience1H_10,
  Experience3H_10,
  Experience8H_10,
  Experience24H_10
}

function getBoosterDataFromType(type: BoosterType): [name: string, length: number, amount: number] {
  const [_, name, length, amount] = BoosterType[type].match(/([A-Za-z]+)(\d+[A-Z])_(\d+)/)!;
  return [name, toSeconds(length), parseInt(amount)];
}

interface ActiveBoosterData {
  readonly type: string;
  readonly amount: number;
  readonly startedAt: number;
  length: number;
}

class ActiveBooster implements ActiveBoosterData {
  public constructor(
    public readonly type: string,
    public length: number,
    public readonly amount: number,
    public readonly startedAt = Math.floor(Date.now() / 1000)
  ) { }

  public static fromData(data: ActiveBoosterData): ActiveBooster {
    return new ActiveBooster(data.type, Math.floor(Date.now() / 1000) - data.startedAt, data.amount);
  }

  public toData(): ActiveBoosterData {
    return {
      type: this.type,
      length: this.length,
      amount: this.amount,
      startedAt: this.startedAt
    };
  }

  public get isExpired(): boolean {
    return Math.floor(Date.now() / 1000) - this.startedAt >= this.length;
  }
}

class ActiveBoostersField {
  /**
   * NOTE: Verify that the member owns the booster you're trying to add!
   */
  public async add(member: GuildMember, type: BoosterType): Promise<ActiveBoosterData[]> {
    let boosters = await this.get(member);
    const booster = new ActiveBooster(...getBoosterDataFromType(type));
    const currentBooster = boosters.find(otherBooster => otherBooster.amount === booster.amount);
    if (currentBooster !== undefined) {
      boosters = boosters.splice(boosters.indexOf(currentBooster), 1);
      currentBooster.length += booster.amount;
    }

    boosters.push(currentBooster ?? booster);
    await LevelSystemData.db.decrement(`levelSystem/${member.id}/ownedBoosters/${type}`, 1, 0);
    return await this.set(member, boosters);
  }

  public async getBoostPercent(member: GuildMember, type: string): Promise<number> {
    const nonExpiredBoosters = (await this.get(member))
      .filter(booster => !ActiveBooster.fromData(booster).isExpired && booster.type === type);

    return nonExpiredBoosters.sort((a, b) => a.amount - b.amount)[0]?.amount ?? 0;
  }

  public async get(member: GuildMember): Promise<ActiveBoosterData[]> {
    return await LevelSystemData.db.get(this.getDirectory(member), []);
  }

  private async set(member: GuildMember, value: ActiveBoosterData[]): Promise<ActiveBoosterData[]> {
    const currentValue = await this.get(member);
    const nonExpiredBoosters = value
      .filter(booster => !ActiveBooster.fromData(booster).isExpired)

    await LevelSystemData.db.set(this.getDirectory(member), nonExpiredBoosters);
    return currentValue;
  }

  private getDirectory(member: GuildMember): string {
    return `levelSystem/${member.id}/activeBoosters`;
  }
}

export class LevelSystemField {
  public constructor(
    private readonly dataKey: string,
    private readonly defaultValue?: number,
    private readonly maximum?: number
  ) { }

  public async increment(member: GuildMember, increment = 1): Promise<number> {
    const currentValue = await this.get(member);
    return await this.set(member, currentValue + increment);
  }

  public async set(member: GuildMember, value: number): Promise<number> {
    const currentValue = await this.get(member);
    value = this.maximum !== undefined ? Math.min(value, this.maximum) : value;
    await LevelSystemData.db.set(this.getDirectory(member), value);
    return currentValue;
  }

  public async get(member: GuildMember): Promise<number> {
    return await LevelSystemData.db.get(this.getDirectory(member), this.defaultValue);
  }

  private getDirectory(member: GuildMember): string {
    return `levelSystem/${member.id}/${this.dataKey}`;
  }
}

class XpField extends LevelSystemField {
  public constructor() {
    super("xp", 0);
  }

  public override async increment(member: GuildMember, increment = 1): Promise<number> {
    const value = await super.increment(member, increment);
    const level = await LevelSystemData.level.get(member);
    const prestige = await LevelSystemData.prestige.get(member);
    const boostPercent = await LevelSystemData.activeBoosters.getBoostPercent(member, "Experience");
    const boostMultiplier = 1 + boostPercent / 100;
    const newValue = value + increment * boostMultiplier;
    const xpToLevelUp = getXpToLevelUp(prestige, level);

    if (newValue >= xpToLevelUp) {
      await LevelSystemData.level.increment(member);
      await this.set(member, newValue - xpToLevelUp);
    }

    return value;
  }
}

function calculateXP(level: number, factor: number): number {
  return Math.floor((level ** 2) + level * factor);
}

const BASE_XP_FACTOR = 80;
const MESSAGE_XP_FACTOR = 8;
export function getXpToLevelUp(prestige: number, level: number): number {
  const prestigeMultiplier = 1 + prestige * 0.10; // 10% decrease per prestige level
  return Math.floor(calculateXP(level, BASE_XP_FACTOR) / prestigeMultiplier);
}

export function getXpPerMessage(prestige: number, level: number, type?: "min" | "max"): number {
  const prestigeMultiplier = 1 + prestige * 0.15; // 15% increase per prestige level
  const median = Math.floor(calculateXP(level, MESSAGE_XP_FACTOR) * prestigeMultiplier / 2.5);
  const variation = 1.5;
  const variationMultiplier = random(1 / variation, variation);
  if (type === "min")
    return Math.floor(median * (1 / variation));
  else if (type === "max")
    return Math.floor(median * variation);

  return Math.floor(median * variationMultiplier);
}

export const MAX_LEVEL = 100;
export const MAX_PRESTIGE = 25;

/** @see GuildData */
export class LevelSystemData {
  public static readonly db = new Firebase(process.env.FIREBASE_URL!);
  public static readonly xp = new XpField;
  public static readonly level = new LevelSystemField("level", 1, MAX_LEVEL);
  public static readonly prestige = new LevelSystemField("prestige", 0, MAX_PRESTIGE);
  public static readonly activeBoosters = new ActiveBoostersField;
  public static readonly xpBoosters = {
    [BoosterType.Experience1H_10]: new LevelSystemField(`ownedBoosters/${BoosterType.Experience1H_10}`, 0),
    [BoosterType.Experience3H_10]: new LevelSystemField(`ownedBoosters/${BoosterType.Experience3H_10}`, 0),
    [BoosterType.Experience8H_10]: new LevelSystemField(`ownedBoosters/${BoosterType.Experience8H_10}`, 0),
    [BoosterType.Experience24H_10]: new LevelSystemField(`ownedBoosters/${BoosterType.Experience24H_10}`, 0),
  };

  /**
   * Adds a random amount of XP to the user
   * @returns True if the user leveled up
   */
  public static async addXP(member: GuildMember): Promise<boolean> {
    const level = await this.level.get(member);
    const prestige = await this.prestige.get(member);
    const xpToAdd = getXpPerMessage(prestige, level);
    await this.xp.increment(member, xpToAdd);

    const newLevel = await this.level.get(member);
    if (newLevel >= MAX_LEVEL)
      await this.xp.set(member, 0);

    return newLevel > level;
  }
}