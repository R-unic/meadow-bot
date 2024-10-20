import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, random, replyWithEmbed, time } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Daily {
  @Slash({ description: "Claims your daily cash reward." })
  public async daily(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const reward = random(50, 200);
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = await EconomyData.lastDailyClaim.get(member);
    if (now - lastClaim <= time.day)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You have already claimed your daily reward today!")]
      });

    await EconomyData.lastDailyClaim.set(member, Math.floor(Date.now() / 1000));
    const earned = await EconomyData.money.earn(member, reward);

    const newMoney = await EconomyData.money.get(member);
    await replyWithEmbed(command, Embed.success(`You have successfully claimed your daily reward of ${currencyFormat(earned)}!\nYou now have ${currencyFormat(newMoney)}.`));
  }
}