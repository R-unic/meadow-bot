import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, User, userMention, type CommandInteraction } from "discord.js";

import Embed from "../../embed-presets.js";

@Discord()
@Category("Fun")
export class Poke {
  @Slash({ description: "Pokes a user" })
  async poke(
    @SlashOption({
      description: "The user to poke",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    command: CommandInteraction
  ): Promise<void> {
    if (!command.channel) return;
    await command.reply({
      content: userMention(user.id),
      embeds: [
        Embed.common("Poke!", "👉")
          .setDescription(`${userMention(command.user.id)} has poked you!`)
          .setColor("#FCF67C")
      ]
    });
  }
}