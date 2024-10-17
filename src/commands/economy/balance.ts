import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type User, type CommandInteraction, userMention } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat } from "../../utility.js";
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
    const isExecutorsBalance = member === command.member;
    const money = await EconomyData.money.get(member);

    await command.reply({
      embeds: [
        Embed.common()
          .setAuthor({
            name: (isExecutorsBalance ? "Your" : userMention(member.id) + "'s") + " Balance",
            iconURL: member.displayAvatarURL()
          })
          .setDescription(`${isExecutorsBalance ? "You" : userMention(member.id)} ${member === command.member ? "have" : "has"} **${EconomyData.dollarSign}${commaFormat(money)}**.`)
      ]
    });
  }
}