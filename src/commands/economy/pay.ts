import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type User, type CommandInteraction, type GuildMember, userMention } from "discord.js";

import { currencyFormat } from "../../utility.js";
import { EconomyData } from "../../data/economy.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Pay {
  @Slash({ description: "Pay someone money." })
  public async pay(
    @SlashOption({
      description: "The user to pay",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      description: "The amount to pay the user",
      name: "amount",
      required: true,
      minValue: 1,
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    if (user === command.user)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot pay yourself!")]
      });

    const member = <GuildMember>command.member;
    const money = await EconomyData.money.get(member);
    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have ${currencyFormat(amount)} to pay.`, money, amount)]
      });

    await EconomyData.money.decrement(member, amount);
    await EconomyData.money.increment(await command.guild.members.fetch(user), amount);

    const newMoney = await EconomyData.money.get(member);
    await command.reply({
      embeds: [Embed.success(`Successfully paid ${userMention(user.id)} ${currencyFormat(amount)}!\nYou now have ${currencyFormat(newMoney)}`)]
    });
  }
}