import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type User, type CommandInteraction } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Balance {
  @Slash({ description: "Returns your cash balance." })
  public async balance(
    @SlashOption({
      description: "The user to view the balance of (omit for self)",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: Maybe<User>,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(user ?? command.user);
    const money = await EconomyData.money.get(member);
    const moneyInBank = await EconomyData.moneyInBank.get(member);

    await command.reply({
      embeds: [
        Embed.common()
          .setAuthor({
            name: (member === command.member ? "Your" : member.user.globalName + "'s") + " Balance 💵",
            iconURL: member.displayAvatarURL()
          })
          .addFields({
            name: "Cash",
            value: currencyFormat(money),
            inline: true
          }, {
            name: "Bank",
            value: currencyFormat(moneyInBank),
            inline: true
          })
      ]
    });
  }
}