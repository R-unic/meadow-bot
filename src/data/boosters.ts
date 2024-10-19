import { NotBot } from "@discordx/utilities";
import { Discord, Guard, On, Once, type Client, type ArgsOf } from "discordx";
import type { GuildMember } from "discord.js";

import { Firebase, getRunesMeadowGuild, time, toSeconds } from "../utility.js";
import { DataName, MemberNumberField } from "./data-field.js";
import { type ActiveBoosterData, ActiveBooster, BoosterType } from "./models/boosters.js";

function getBoosterDataFromType(type: BoosterType): [name: string, length: number, amount: number] {
  const [_, name, length, amount] = BoosterType[type].match(/([A-Za-z]+)(\d+[A-Z])_(\d+)/)!;
  return [name, toSeconds(length), parseInt(amount)];
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

@Discord()
export class BoostersData {
  public static readonly dailyStreak = new MemberNumberField(DataName.LevelSystem, "dailyStreak", 0, 30);
  public static readonly lastStreakIncrement = new MemberNumberField(DataName.LevelSystem, "lastStreakIncrement", 0);
  public static readonly activeBoosters = new ActiveBoostersField;
  public static readonly ownedBoosters = {
    [BoosterType.Experience1H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience1H_10}`, 0),
    [BoosterType.Experience3H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience3H_10}`, 0),
    [BoosterType.Experience8H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience8H_10}`, 0),
    [BoosterType.Experience24H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Experience24H_10}`, 0),
    [BoosterType.Money1H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Money1H_10}`, 0),
    [BoosterType.Money3H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Money3H_10}`, 0),
    [BoosterType.Money8H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Money8H_10}`, 0),
    [BoosterType.Money24H_10]: new MemberNumberField(DataName.LevelSystem, `ownedBoosters/${BoosterType.Money24H_10}`, 0)
  };

  @Once()
  public async ready([client]: ArgsOf<"ready">): Promise<void> {
    this.poll(<Client>client);
  }

  @On()
  @Guard(NotBot)
  public messageCreate([{ member }]: ArgsOf<"messageCreate">): void {
    if (member === null) return;
    this.checkStreak(member, true);
  }

  private poll(client: Client): void {
    this.checkAllMemberStreaks(client);
    setTimeout(async () => {
      await this.checkAllMemberStreaks(client);
      this.poll(client);
    }, 15 * 1000 * time.minutes); // every 15 minutes
  }

  private async checkAllMemberStreaks(client: Client): Promise<void> {
    const guild = await getRunesMeadowGuild(<Client>client);
    const members = await guild.members.fetch();
    const promises: Promise<void>[] = [];
    for (const member of members.values())
      promises.push(this.checkStreak(member));

    await Promise.all(promises);
  }

  private async checkStreak(member: GuildMember, createdMessage = false): Promise<void> {
    const lastStreakIncrement = await BoostersData.lastStreakIncrement.get(member);
    const now = Date.now() / 1000;
    if (now - lastStreakIncrement >= time.day) {
      await BoostersData.lastStreakIncrement.set(member, Date.now() / 1000);
      await BoostersData.dailyStreak.increment(member);
    } else if (now - lastStreakIncrement >= 2 * time.days) {
      await BoostersData.lastStreakIncrement.set(member, Date.now() / 1000);
      await BoostersData.dailyStreak.set(member, createdMessage ? 1 : 0);
    }
  }
}