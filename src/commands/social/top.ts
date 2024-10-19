import { Discord, Slash, SlashGroup } from "discordx";
import { Category } from "@discordx/utilities";
import { bold, userMention, type CommandInteraction, type GuildMember, type Snowflake } from "discord.js";

import { currencyFormat, Firebase, replyWithEmbed } from "../../utility.js";
import type { EconomyMemberData } from "../../data/models/economy.js";
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
      .sort(([_, a], [__, b]) => (a.money + a.moneyInBank) - (b.money + b.moneyInBank))
      .slice(0, 15)
      .reverse()
      .map(([member, { money, moneyInBank }], i) => `${bold((i + 1).toString() + ". ")} ${userMention(member.id)} — ${currencyFormat(money + moneyInBank)}`)
      .join("\n");

    await replyWithEmbed(command,
      Embed.common("Top Players - Money", "💵")
        .setDescription(description)
    );
  }
}