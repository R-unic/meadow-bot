import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, ApplicationCommandOptionType } from "discord.js";

import { createTemporaryAttachment, findWizWorld } from "../../utility.js";
import Embed from "../../embed-presets.js";
const { default: Worlds } = await import("../../data/wiz-worlds.json", { with: { type: "json" } });

@Discord()
@Category("Wizard101")
export class WorldAreas {
  @Slash({ description: "Returns all area names in the given Wizard101 world." })
  public async "world-areas"(
    @SlashOption({
      description: "The name or abbreviation of the world",
      name: "world-name",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete(interaction) {
        return interaction.respond(Object.values(Worlds).map(world => ({ name: world.Name, value: world.Name })));
      }
    })
    name: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    const world = findWizWorld(name);
    if (world === undefined)
      return void await command.reply({
        options: { ephemeral: true },
        embeds: [Embed.error("That is not a valid Wizard101 world.")]
      });

    const tempAttachment = createTemporaryAttachment("world_icon.png", new DataView(await fetch(world.Icon).then(res => res.arrayBuffer())));
    await command.reply({
      files: [tempAttachment.attachment],
      embeds: [
        Embed.common(`Areas in ${world.Name}`, "🌎")
          .setDescription(world.Areas.map(area => `- ${area}`).join("\n"))
          .setThumbnail(tempAttachment.url)
      ]
    });
  }
}