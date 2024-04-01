import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, channelMention } from "discord.js";

import { GuildData } from "../../data/guild.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
export class Snipe {
  @Slash({ description: "Returns the last message that was deleted, or the message sent `offset` messages ago" })
  public async snipe(
    @SlashOption({
      description: "The offset to search through the list of snipes for",
      name: "offset",
      required: false,
      type: ApplicationCommandOptionType.Number,
      minValue: 1
    })
    offset = 1,
    command: CommandInteraction
  ): Promise<void> {
    if (!command.guild) return;

    const snipes = await GuildData.getSnipes("delete");
    const [snipe] = snipes.slice(-offset);
    if (!snipe)
      return void await command.reply({ embeds: [Embed.error("There are no stored message deletion snipes yet.")] });

    const author = await command.guild.members.fetch(snipe.authorID);
    await command.reply({
      embeds: [
        Embed.common("Sniped!", "🔫")
          .setDescription(`${channelMention(snipe.channelID)}\n**Deleted message:** ${snipe.messageContent}`)
          .setTimestamp(snipe.timestamp)
          .setAuthor({
            name: author.user.username,
            iconURL: author.displayAvatarURL()!
          })
      ]
    });
  }
}