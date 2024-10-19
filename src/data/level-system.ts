import type { GuildMember } from "discord.js";

import { random } from "../utility.js";
import { BoostersData } from "./boosters.js";
import { MemberNumberField, DataName } from "./data-field.js";

class XpField extends MemberNumberField {
  public constructor() {
    super(DataName.LevelSystem, "xp", 0);
  }

  public override async increment(member: GuildMember, increment = 1): Promise<number> {
    const value = await super.increment(member, increment);
    const level = await LevelSystemData.level.get(member);
    const newValue = value + increment;
    const xpToLevelUp = getXpToLevelUp(level);

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
export function getXpToLevelUp(level: number): number {
  return calculateXP(level, BASE_XP_FACTOR);
}

export async function getXpPerMessage(member: GuildMember, prestige: number, level: number, type?: "min" | "max"): Promise<number> {
  const prestigeMultiplier = 1 + prestige * 0.15; // 15% increase per prestige level
  const boostPercent = await BoostersData.activeBoosters.getBoostPercent(member, "Experience");
  const boostMultiplier = 1 + boostPercent / 100;
  const median = Math.floor(calculateXP(level, MESSAGE_XP_FACTOR) * prestigeMultiplier * boostMultiplier / 2.5);
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
  public static readonly xp = new XpField;
  public static readonly level = new MemberNumberField(DataName.LevelSystem, "level", 1, MAX_LEVEL);
  public static readonly prestige = new MemberNumberField(DataName.LevelSystem, "prestige", 0, MAX_PRESTIGE);

  /**
   * Adds a random amount of XP to the user
   * @returns True if the user leveled up
   */
  public static async addXP(member: GuildMember): Promise<boolean> {
    const level = await this.level.get(member);
    const prestige = await this.prestige.get(member);
    const xpToAdd = await getXpPerMessage(member, prestige, level);
    await this.xp.increment(member, xpToAdd);

    const newLevel = await this.level.get(member);
    if (newLevel >= MAX_LEVEL)
      await this.xp.set(member, 0);

    return newLevel > level;
  }
}