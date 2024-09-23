import type { GuildMember } from "discord.js";

import { Firebase } from "../firebase.js";

class LevelSystemField {
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

  private getDirectory(member: GuildMember): string | undefined {
    return `levelSystem/${member.id}/${this.dataKey}`;
  }
}

const BASE_XP_FACTOR = 80;
const MESSAGE_XP_FACTOR = 10;
class XpField extends LevelSystemField {
  public constructor() {
    super("xp", 0);
  }

  public override async increment(member: GuildMember, increment = 1): Promise<number> {
    const value = await super.increment(member, increment);
    const level = await LevelSystemData.level.get(member);
    const prestige = await LevelSystemData.prestige.get(member);
    const newValue = value + increment;
    const xpToLevelUp = getXpToLevelUp(prestige, level);

    if (newValue >= xpToLevelUp) {
      LevelSystemData.level.increment(member);
      this.increment(member, newValue - xpToLevelUp);
    }

    return value;
  }
}

function calculateXP(prestige: number, level: number, factor: number) {
  const prestigeMultiplier = 1 + prestige * 0.1; // 10% increase per prestige level
  return (level ** 2) + level * prestigeMultiplier * factor;
}

export const MAX_LEVEL = 100;
export const MAX_PRESTIGE = 25;

export function getXpToLevelUp(prestige: number, level: number) {
  return calculateXP(prestige, level, BASE_XP_FACTOR);
}

/** @see GuildData */
export class LevelSystemData {
  public static readonly db = new Firebase(process.env.FIREBASE_URL!);
  public static readonly xp = new XpField;
  public static readonly level = new LevelSystemField("level", 1, MAX_LEVEL);
  public static readonly prestige = new LevelSystemField("prestige", 0, MAX_PRESTIGE);

  /**
   * Adds a random amount of XP to the user
   * @returns True if the user leveled up
   */
  public static async addXP(member: GuildMember): Promise<boolean> {
    const level = await this.level.get(member);
    const prestige = await this.prestige.get(member);
    const xpToAdd = calculateXP(prestige, level, MESSAGE_XP_FACTOR);
    await this.xp.increment(member, xpToAdd);

    const newLevel = await this.level.get(member);
    return newLevel > level;
  }
}