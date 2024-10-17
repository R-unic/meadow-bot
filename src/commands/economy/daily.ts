import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat, random, time } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Daily {
  @Slash({ description: "Claims your daily cash reward." })
  public async daily(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const reward = random(250, 500);
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = await EconomyData.lastDailyClaim.get(member);
    if (now - lastClaim <= time.day)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error(`You have already claimed your daily reward today!`)]
      });

    await EconomyData.lastDailyClaim.set(member, Math.floor(Date.now() / 1000));
    await EconomyData.money.earn(member, reward);

    const newMoney = await EconomyData.money.get(member);
    await command.reply({
      embeds: [Embed.success(`You have successfully claimed your daily reward of **${EconomyData.dollarSign}${commaFormat(reward)}**!\nYou now have **${EconomyData.dollarSign}${commaFormat(newMoney)}**`)]
    });
  }
}