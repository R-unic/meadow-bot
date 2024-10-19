import { ArgsOf, Discord, On, type Client } from "discordx";
import type { GuildMember } from "discord.js";

import { getRunesMeadowGuild, time } from "../utility.js";
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
@Discord()
export class EconomyData {
  public static readonly dollarSign = "$";
  public static readonly bankInterestRate = 5; // percent
  public static readonly interestSpeed = 6 * 60 * 60; // gain interest every six hours
  public static readonly money = new MoneyField;
  public static readonly moneyInBank = new MemberNumberField(DataName.Economy, "moneyInBank", 0);
  public static readonly lastDailyClaim = new MemberNumberField(DataName.Economy, "lastDailyClaim", 0);
  public static readonly lastWeeklyClaim = new MemberNumberField(DataName.Economy, "lastWeeklyClaim", 0);
  public static readonly lastInterestGain = new MemberNumberField(DataName.Economy, "lastInterestGain", 0);

  @On()
  public ready([client]: ArgsOf<"ready">): void {
    this.poll(<Client>client);
  }

  private poll(client: Client): void {
    setTimeout(async () => {
      await this.addInterest(client);
      this.poll(client);
    }, 5 * time.minutes); // every 5 minutes
  }

  private async addInterest(client: Client): Promise<void> {
    const guild = await getRunesMeadowGuild(client);
    const promises: Promise<void>[] = [];

    for (const [_, member] of guild.members.cache)
      promises.push(new Promise(async resolve => {
        const now = Date.now() / 1000;
        const lastInterestGain = await EconomyData.lastInterestGain.get(member);
        if (now - lastInterestGain >= EconomyData.interestSpeed) {
          const gainAmount = Math.floor((now - lastInterestGain) / EconomyData.interestSpeed);
          const remainder = (now - lastInterestGain) % EconomyData.interestSpeed;
          await EconomyData.lastInterestGain.set(member, remainder);

          const moneyInBank = await EconomyData.moneyInBank.get(member);
          const interestMultiplier = 1 + EconomyData.bankInterestRate / 100;
          await EconomyData.moneyInBank.set(member, moneyInBank * interestMultiplier * gainAmount);
        }

        resolve();
      }));

    await Promise.all(promises);
  }
}