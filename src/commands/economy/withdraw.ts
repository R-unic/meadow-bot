import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Withdraw {
  @Slash({ description: "Withdraw cash from your bank." })
  public async withdraw(
    @SlashOption({
      description: "The amount to withdraw",
      name: "amount",
      required: false,
      minValue: 0.01,
      type: ApplicationCommandOptionType.Number,
    })
    amount: Maybe<number>,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const money = await EconomyData.moneyInBank.get(member);
    amount ??= money;
    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have ${currencyFormat(amount)} to withdraw.`, money, amount)]
      });

    await EconomyData.moneyInBank.decrement(member, amount);
    await EconomyData.money.increment(member, amount);

    const newMoney = await EconomyData.moneyInBank.get(member);
    await replyWithEmbed(command, Embed.success(`You have successfully withdrawn ${currencyFormat(amount)} from your bank!\nYou now have ${currencyFormat(newMoney)} in your bank.`));
  }
}