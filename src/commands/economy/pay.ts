import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type User, type CommandInteraction, userMention, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat } from "../../utility.js";
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
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    if (user === command.user)
      return void await command.reply({
        embeds: [Embed.error("You cannot pay yourself!")]
      });

    const member = <GuildMember>command.member;
    const money = await EconomyData.money.get(member);
    if (amount > money)
      return void await command.reply({
        embeds: [Embed.error(`You do not have **${EconomyData.dollarSign}${amount}** to pay. You need **${EconomyData.dollarSign}${amount - money}** more.`)]
      });

    await EconomyData.money.decrement(member, amount);
    await EconomyData.money.increment(await command.guild.members.fetch(user), amount);
    await command.reply({
      embeds: [Embed.success(`Successfully paid ${userMention(user.id)} **${EconomyData.dollarSign}${amount}**!`)]
    });
  }
}