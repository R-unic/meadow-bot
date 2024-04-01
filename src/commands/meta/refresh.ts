import { type Client, Discord, Guard, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction } from "discord.js";

import { RequirePermissions } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Meta")
@Guard(RequirePermissions(["Administrator"]))
export class Refresh {
  @Slash({ description: "Refreshes all application commands. Do not use super often or risk rate limiting" })
  public async refresh(command: CommandInteraction, client: Client): Promise<void> {
    if (!command.channel) return;

    client.application?.commands.set([]);
    await client.initApplicationCommands();

    await command.reply({
      embeds: [Embed.success(`Successfully refreshed all application commands!`)]
    });
  }
}