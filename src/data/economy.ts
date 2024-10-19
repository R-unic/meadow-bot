import type { GuildMember } from "discord.js";

import { MemberNumberField, DataName } from "./data-field.js";
import { BoostersData } from "./boosters.js";

class MoneyField extends MemberNumberField {
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
  public static readonly bankInterestRate = 5; // percent
  public static readonly interestSpeed = 6 * 60 * 60; // gain interest every six hours
  public static readonly money = new MoneyField;
  public static readonly moneyInBank = new MemberNumberField(DataName.Economy, "moneyInBank", 0);
  public static readonly lastDailyClaim = new MemberNumberField(DataName.Economy, "lastDailyClaim", 0);
  public static readonly lastWeeklyClaim = new MemberNumberField(DataName.Economy, "lastWeeklyClaim", 0);
}