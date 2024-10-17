import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat, random, time } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Weekly {
  @Slash({ description: "Claims your weekly cash reward." })
  public async weekly(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const reward = random(1500, 3000);
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = await EconomyData.lastWeeklyClaim.get(member);
    if (now - lastClaim <= time.week)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error(`You have already claimed your weekly reward this week!`)]
      });

    await EconomyData.lastWeeklyClaim.set(member, Math.floor(Date.now() / 1000));
    await EconomyData.money.earn(member, reward);
    await command.reply({
      embeds: [Embed.success(`You have successfully claimed your weekly reward of **${EconomyData.dollarSign}${commaFormat(reward)}**!`)]
    });
  }
}