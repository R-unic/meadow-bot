import { Discord, Slash, SlashGroup } from "discordx";
import { Category } from "@discordx/utilities";
import { bold, userMention, type CommandInteraction, type GuildMember, type Snowflake } from "discord.js";
const { default: { toRoman } } = await import("roman-numerals");

import { commaFormat, currencyFormat, Firebase, replyWithEmbed } from "../../utility.js";
import type { EconomyMemberData } from "../../data/models/economy.js";
import type { LevelSystemMemberData } from "../../data/models/level-system.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
@SlashGroup({
  name: "top",
  description: "View the best players in the server."
})
export class Top {
  @Slash({ description: "View the richest players." })
  @SlashGroup("top")
  public async balance(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const description = (await Promise.all(Object.entries(await Firebase.get<Record<Snowflake, EconomyMemberData>>("economy"))
      .map<Promise<[GuildMember, EconomyMemberData]>>(async ([id, data]) => {
        const mutableData = <Mutable<EconomyMemberData>>data;
        mutableData.money ??= 0;
        mutableData.moneyInBank ??= 0;
        return [await command.guild!.members.fetch(id), <Readonly<EconomyMemberData>>mutableData];
      })))
      .sort(([_, a], [__, b]) => (b.money + b.moneyInBank) - (a.money + a.moneyInBank))
      .slice(0, 15)
      .map(([member, { money, moneyInBank }], i) => `${bold((i + 1).toString() + ". ")} ${userMention(member.id)} — ${currencyFormat(money + moneyInBank)}`)
      .join("\n");

    await replyWithEmbed(command,
      Embed.common("Top Players - Money", "💵")
        .setDescription(description)
    );
  }

  @Slash({ description: "View the highest level players." })
  @SlashGroup("top")
  public async level(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const description = (await Promise.all(Object.entries(await Firebase.get<Record<Snowflake, LevelSystemMemberData>>("levelSystem"))
      .map<Promise<[GuildMember, LevelSystemMemberData]>>(async ([id, data]) => {
        const mutableData = <Mutable<LevelSystemMemberData>>data;
        mutableData.prestige ??= 0;
        mutableData.level ??= 1;
        mutableData.xp ??= 0;
        return [await command.guild!.members.fetch(id), <Readonly<LevelSystemMemberData>>mutableData];
      })))
      .sort(([_, a], [__, b]) => {
        if (a.prestige !== b.prestige)
          return b.prestige - a.prestige;
        if (a.level !== b.level)
          return b.level - a.level;

        return b.xp - a.xp;
      })
      .slice(0, 15)
      .map(([member, { prestige, level, xp }], i) => `${bold((i + 1).toString() + ". ")} ${userMention(member.id)} — ${prestige > 0 ? toRoman(prestige) + "-" : ""}${level} (${commaFormat(xp)} XP)`)
      .join("\n");

    await replyWithEmbed(command,
      Embed.common("Top Players - Level", "⭐")
        .setDescription(description)
    );
  }
}