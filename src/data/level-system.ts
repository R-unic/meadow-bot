import type { GuildMember } from "discord.js";

import { Firebase } from "../firebase.js";

class LevelSystemField {
  public constructor(
    private readonly dataKey: string
  ) {}

  public async increment(member: GuildMember, increment = 1): Promise<number> {
    const currentValue = await this.get(member);
    return await this.set(member, currentValue + increment);
  }

  public async set(member: GuildMember, value: number): Promise<number> {
    const currentValue = await this.get(member);
    await LevelSystemData.db.set(this.getDirectory(member), value);
    return currentValue;
  }

  public async get(member: GuildMember): Promise<number> {
    return await LevelSystemData.db.get(this.getDirectory(member));
  }

  private getDirectory(member: GuildMember): string | undefined {
    return `levelSystem/${member.id}/${this.dataKey}`;
  }
}

/** @see GuildData */
export class LevelSystemData {
  public static readonly db = new Firebase(process.env.FIREBASE_URL!);
  public static readonly level = new LevelSystemField("level");
  public static readonly xp = new LevelSystemField("xp");
  public static readonly prestige = new LevelSystemField("prestige");
}