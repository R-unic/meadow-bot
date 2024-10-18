import type { GuildMember } from "discord.js";

import { DataField, DataName } from "./data-field.js";
import { BoostersData } from "./boosters.js";

class MoneyField extends DataField {
  public constructor() {
    super(DataName.Economy, "money", 0);
  }

  public async earn(member: GuildMember, amount = 1): Promise<number> {
    const boostPercent = await BoostersData.activeBoosters.getBoostPercent(member, "Money");
    const boostMultiplier = 1 + boostPercent / 100;
    return await this.increment(member, amount * boostMultiplier);
  }
}

/** @see GuildData */
export class EconomyData {
  public static readonly dollarSign = "$";
  public static readonly money = new MoneyField;
  public static readonly moneyInBank = new DataField(DataName.Economy, "moneyInBank", 0);
  public static readonly lastDailyClaim = new DataField(DataName.Economy, "lastDailyClaim", 0);
  public static readonly lastWeeklyClaim = new DataField(DataName.Economy, "lastWeeklyClaim", 0);
}