import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { Category, PermissionGuard } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction } from "discord.js";

import { Firebase } from "../../firebase.js";
import { RequirePermissions } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Meta")
@Guard(RequirePermissions(["Administrator"]))
@SlashGroup({
  name: "data",
  description: "Commands to look at or modify data (soon)"
})
export class Data {
  @Slash({ description: "View the data at `path`" })
  @SlashGroup("data")
  public async view(
    @SlashOption({
      description: "The path of the data",
      name: "path",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    path: string,
    command: CommandInteraction
  ): Promise<void> {
    if (!command.channel) return;

    const pathParts = path.split("/");
    const root = pathParts.shift()!;
    const db = new Firebase(root, process.env.FIREBASE_URL!);
    const result = await db.get(pathParts.join("/"));
    if (result === undefined)
      return void await command.reply({
        embeds: [Embed.error(`There is no data at path \`${path}\`.`)]
      });

    await command.reply({
      embeds: [Embed.success(`\`\`\`json\n${JSON.stringify(result, undefined, 2).slice(0, 4095)}\`\`\``)]
    });
  }
}