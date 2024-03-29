import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction } from "discord.js";

import { deleteIfPossible } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
export class Ping {
  @Slash({ description: "Returns the latency between your computer and Discord's servers" })
  public async ping(command: CommandInteraction): Promise<void> {
    if (!command.channel) return;
    const msg = await command.channel.send("Pinging...");
    const latency = msg.createdTimestamp - command.createdTimestamp;
    deleteIfPossible(msg);

    await command.reply({
      embeds: [
        Embed.common("Pong!", "🏓")
          .setDescription(`Latency: ${Math.max(latency, 0)}ms`)
      ]
    });
  }
}