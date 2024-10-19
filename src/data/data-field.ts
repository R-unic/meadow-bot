import type { GuildMember } from "discord.js";

import { Firebase } from "../utility.js";

export const enum DataName {
  ReputationSystem = "reputationSystem",
  LevelSystem = "levelSystem",
  Economy = "economy"
}

export class DataField<T> {
  public constructor(
    protected readonly directory: DataName,
    private readonly defaultValue?: T
  ) { }

  public async set(value: T): Promise<T> {
    const currentValue = await this.get();
    await Firebase.set(this.directory, value);
    return currentValue;
  }

  public async get(): Promise<T> {
    return await Firebase.get(this.directory, this.defaultValue);
  }
}

export class MemberDataField<T> {
  public constructor(
    private readonly name: DataName,
    private readonly dataKey: string,
    private readonly defaultValue?: T
  ) { }

  public async set(member: GuildMember, value: T): Promise<T> {
    const currentValue = await this.get(member);
    await Firebase.set(this.getDirectory(member), value);
    return currentValue;
  }

  public async get(member: GuildMember): Promise<T> {
    return await Firebase.get(this.getDirectory(member), this.defaultValue);
  }

  private getDirectory(member: GuildMember): string {
    return `${this.name}/${member.id}/${this.dataKey}`;
  }
}

export class MemberNumberField extends MemberDataField<number> {
  public constructor(
    name: DataName,
    dataKey: string,
    defaultValue?: number,
    private readonly maximum?: number
  ) { super(name, dataKey, defaultValue); }

  public async decrement(member: GuildMember, increment = 1): Promise<number> {
    return await this.increment(member, -increment)
  }

  public async increment(member: GuildMember, increment = 1): Promise<number> {
    const currentValue = await this.get(member);
    return await this.set(member, currentValue + increment);
  }

  public override async set(member: GuildMember, value: number): Promise<number> {
    value = this.maximum !== undefined ? Math.min(value, this.maximum) : value;
    return super.set(member, value);
  }
}
