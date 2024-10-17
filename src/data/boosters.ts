import type { GuildMember } from "discord.js";

import { Firebase, toSeconds } from "../utility.js";
import { DataField, DataName } from "./data-field.js";

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

export class ActiveBooster implements ActiveBoosterData {
  public constructor(
    public readonly type: string,
    public length: number,
    public readonly amount: number,
    public readonly startedAt = Math.floor(Date.now() / 1000)
  ) { }

  public static fromData(data: ActiveBoosterData): ActiveBooster {
    return new ActiveBooster(data.type, data.length, data.amount, data.startedAt);
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
    const boosters = await this.get(member);
    const booster = new ActiveBooster(...getBoosterDataFromType(type));
    const currentBooster = boosters.find(otherBooster => otherBooster.amount === booster.amount && otherBooster.type === booster.type);
    if (currentBooster !== undefined) {
      boosters.splice(boosters.indexOf(currentBooster), 1);
      currentBooster.length += booster.length;
    }

    boosters.push(currentBooster ?? booster);
    await Firebase.decrement(`levelSystem/${member.id}/ownedBoosters/${type}`, 1, 0);
    return await this.set(member, boosters);
  }

  public async getBoostPercent(member: GuildMember, type: string): Promise<number> {
    return (await this.getUnexpired(member))
      .filter(booster => booster.type === type)
      .sort((a, b) => a.amount - b.amount)[0]?.amount ?? 0;
  }

  public async getUnexpired(member: GuildMember): Promise<ActiveBoosterData[]> {
    const activeBoosters = await this.get(member);
    const unexpiredBoosters = activeBoosters
      .filter(booster => !ActiveBooster.fromData(booster).isExpired);

    if (activeBoosters !== unexpiredBoosters)
      await this.set(member, unexpiredBoosters);

    return unexpiredBoosters;
  }

  private async get(member: GuildMember): Promise<ActiveBoosterData[]> {
    return await Firebase.get(this.getDirectory(member), []);
  }

  private async set(member: GuildMember, value: ActiveBoosterData[]): Promise<ActiveBoosterData[]> {
    const currentValue = await this.get(member);
    const unexpiredBoosters = value
      .filter(booster => !ActiveBooster.fromData(booster).isExpired)

    await Firebase.set(this.getDirectory(member), unexpiredBoosters);
    return currentValue;
  }

  private getDirectory(member: GuildMember): string {
    return `levelSystem/${member.id}/activeBoosters`;
  }
}


export class BoostersData {
  public static readonly activeBoosters = new ActiveBoostersField;
  public static readonly ownedBoosters = {
    [BoosterType.Experience1H_10]: new DataField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience1H_10}`, 0),
    [BoosterType.Experience3H_10]: new DataField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience3H_10}`, 0),
    [BoosterType.Experience8H_10]: new DataField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience8H_10}`, 0),
    [BoosterType.Experience24H_10]: new DataField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience24H_10}`, 0),
  };
}