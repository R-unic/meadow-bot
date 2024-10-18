import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Deposit {
  @Slash({ description: "Deposit cash into your bank." })
  public async deposit(
    @SlashOption({
      description: "The amount to deposit",
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
    await EconomyData.money.decrement(member, amount);
    await EconomyData.moneyInBank.increment(member, amount);

    const newMoney = await EconomyData.money.get(member);
    await replyWithEmbed(command, Embed.success(`You have successfully deposited **${EconomyData.dollarSign}${commaFormat(amount)}** into your bank!\nYou now have **${EconomyData.dollarSign}${commaFormat(newMoney)}** in cash.`));
  }
}