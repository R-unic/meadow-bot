import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type User, type CommandInteraction, userMention, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat, random } from "../../utility.js";
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
      type: ApplicationCommandOptionType.Integer,
    })
    number: number,
    @SlashOption({
      description: "The amount to bet",
      name: "amount",
      required: true,
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
        embeds: [Embed.error(`You do not have **${EconomyData.dollarSign}${amount}** to bet! You need **${EconomyData.dollarSign}${amount - money}** more.`)]
      });

    const roll = random(1, 6);
    if (roll === number) {
      await EconomyData.money.increment(member, amount);
      await command.reply({
        embeds: [
          Embed.common("You won!", "🎉")
            .setColor("#3BCC6E")
            .setDescription(`The die rolled **${roll}** which is the same number you chose. You won **${EconomyData.dollarSign}${commaFormat(amount)}**!`)
        ]
      });
    } else {
      await EconomyData.money.decrement(member, amount);
      await command.reply({
        embeds: [
          Embed.common("You lost!", "💔")
            .setColor("#AD4234")
            .setDescription(`The die rolled **${roll}**. You lost **${EconomyData.dollarSign}${commaFormat(amount)}**.`)
        ]
      });
    }
  }
}