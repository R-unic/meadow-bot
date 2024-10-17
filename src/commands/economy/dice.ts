import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { random, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Dice {
  @Slash({ description: "Bet on a die rolling your chosen number." })
  public async dice(
    @SlashOption({
      description: "The number to bet on",
      name: "number",
      required: true,
      minValue: 1,
      maxValue: 6,
      type: ApplicationCommandOptionType.Integer,
    })
    number: number,
    @SlashOption({
      description: "The amount to bet",
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
    const money = await EconomyData.money.get(member);
    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have **${EconomyData.dollarSign}${amount}** to bet.`, money, amount)]
      });

    if (number > 6)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You can not bet on more than 6 in a dice game.")]
      });

    const roll = random(1, 6);
    if (roll === number) {
      await EconomyData.money.increment(member, amount * 5); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`The die rolled **${roll}** which is the same number you chose.`, member, amount * 5));
    } else {
      await EconomyData.money.decrement(member, amount);
      await replyWithEmbed(command, await Embed.lose(`The die rolled **${roll}**.`, member, amount));
    }
  }
}