import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, escapeInlineCode, type CommandInteraction } from "discord.js";

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
      required: false,
      type: ApplicationCommandOptionType.String
    })
    path = "",
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    try {
      const db = new Firebase(process.env.FIREBASE_URL!);
      const result = await db.get(path);
      if (result === undefined && path !== "")
        return void await command.reply({
          embeds: [Embed.error(`There is no data at path \`${path}\`.`)],
          ephemeral: true
        });

      await command.reply({
        embeds: [Embed.success(`\`\`\`json\n${escapeInlineCode(JSON.stringify(result ?? {}, undefined, 2)).slice(0, 4084)}\`\`\``)]
      });
    } catch (error) {
      await command.reply({
        embeds: [Embed.error(<string>error)],
        ephemeral: true
      });
    }
  }

  @Slash({ description: "Delete the data at `path`" })
  @SlashGroup("data")
  public async delete(
    @SlashOption({
      description: "The path of the data",
      name: "path",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    path: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    try {
      const db = new Firebase(process.env.FIREBASE_URL!);
      const result = await db.get(path);
      if (result === undefined)
        return void await command.reply({
          ephemeral: true,
          embeds: [Embed.error(`There is no data at path \`${path}\`.`)]
        });

      await db.delete(path);
      await command.reply({
        embeds: [Embed.success(`Successfully deleted data at path \`${path}\`!`)]
      });
    } catch (error) {
      await command.reply({
        embeds: [Embed.error(<string>error)]
      });
    }
  }
}