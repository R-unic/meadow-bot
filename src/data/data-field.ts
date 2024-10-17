import type { GuildMember } from "discord.js";

import { Firebase } from "../utility.js";

export const enum DataName {
  LevelSystem = "levelSystem",
  Economy = "economy"
}

export class DataField {
  public constructor(
    private readonly name: DataName,
    private readonly dataKey: string,
    private readonly defaultValue?: number,
    private readonly maximum?: number
  ) { }

  public async decrement(member: GuildMember, increment = 1): Promise<number> {
    return await this.increment(member, -increment)
  }

  public async increment(member: GuildMember, increment = 1): Promise<number> {
    const currentValue = await this.get(member);
    return await this.set(member, currentValue + increment);
  }

  public async set(member: GuildMember, value: number): Promise<number> {
    const currentValue = await this.get(member);
    value = this.maximum !== undefined ? Math.min(value, this.maximum) : value;
    await Firebase.set(this.getDirectory(member), value);
    return currentValue;
  }

  public async get(member: GuildMember): Promise<number> {
    return await Firebase.get(this.getDirectory(member), this.defaultValue);
  }

  private getDirectory(member: GuildMember): string {
    return `${this.name}/${member.id}/${this.dataKey}`;
  }
}
