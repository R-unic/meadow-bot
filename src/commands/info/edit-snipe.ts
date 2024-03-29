import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type TextChannel, type CommandInteraction, messageLink } from "discord.js";

import { GuildData } from "../../data.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
export class EditSnipe {
  @Slash({ description: "Returns the last message that was edited, or the message sent `offset` messages ago" })
  public async "edit-snipe"(
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

    const snipes = await GuildData.getSnipes(command.guild.id, "edit");
    const [snipe] = snipes.slice(-offset);
    if (!snipe)
      return void await command.reply({ embeds: [Embed.error("There are no stored message edit snipes yet.")] });

    const author = await command.guild.members.fetch(snipe.authorID);
    const messageChannel = <TextChannel>await command.guild.channels.fetch(snipe.channelID);
    const message = await messageChannel.messages.fetch(snipe.messageID);
    await command.reply({
      embeds: [
        Embed.common("Sniped Edit!", "🔫")
          .setColor("#4479CF")
          .setDescription(`${messageLink(snipe.channelID, snipe.messageID)}\n**Original message:** ${snipe.messageContent}\n**Edited message:** ${message.content}`)
          .setTimestamp(snipe.timestamp)
          .setAuthor({
            name: author.user.username,
            iconURL: author.displayAvatarURL()
          })
      ]
    });
  }
}