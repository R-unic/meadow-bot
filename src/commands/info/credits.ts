import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { userMention, type CommandInteraction } from "discord.js";

import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
export class Credits {
  @Slash({ description: "Displays information about the creation/hosting of this bot" })
  async credits(command: CommandInteraction): Promise<void> {
    if (!command.channel) return;
    await command.reply({
      embeds: [
        Embed.common("Credits", "🗒️")
          .addFields([
            {
              name: "Developer",
              value: userMention("215188040535113729"),
              inline: true
            }, {
              name: "Hosting",
              value: userMention("1037800611669889114"),
              inline: true
            }
          ])
          .setColor("#4479CF")
      ]
    });
  }
}