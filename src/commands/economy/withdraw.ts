import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Withdraw {
  @Slash({ description: "Withdraw cash from your bank." })
  public async withdraw(
    @SlashOption({
      description: "The amount to withdraw",
      name: "amount",
      required: true,
      minValue: 1,
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    await EconomyData.moneyInBank.decrement(member, amount);
    await EconomyData.money.increment(member, amount);

    const newMoney = await EconomyData.moneyInBank.get(member);
    await replyWithEmbed(command, Embed.success(`You have successfully withdrawn **${EconomyData.dollarSign}${commaFormat(amount)}** from your bank!\nYou now have **${EconomyData.dollarSign}${commaFormat(newMoney)}** in your bank.`));
  }
}