import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Deposit {
  @Slash({ description: "Deposit cash into your bank." })
  public async deposit(
    @SlashOption({
      description: "The amount to deposit",
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
    const money = await EconomyData.money.get(member);
    amount ??= money;
    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have ${currencyFormat(amount)} to deposit.`, money, amount)]
      });

    await EconomyData.money.decrement(member, amount);
    await EconomyData.moneyInBank.increment(member, amount);

    const newMoney = await EconomyData.money.get(member);
    await replyWithEmbed(command, Embed.success(`You have successfully deposited ${currencyFormat(amount)} into your bank!\nYou now have ${currencyFormat(newMoney)} in cash.`));
  }
}