import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, ApplicationCommandOptionType } from "discord.js";

import { createTemporaryAttachment, findWizWorld } from "../../utility.js";
import Embed from "../../embed-presets.js";
const { default: Worlds } = await import("../../data/wiz-worlds.json", { with: { type: "json" } });

@Discord()
@Category("Wizard101")
export class WorldProgress {
  @Slash({ description: "Returns your progress through the given Wizard101 world." })
  public async "world-progress"(
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
    @SlashOption({
      description: "The current quest number you are on",
      name: "quest-number",
      required: true,
      minValue: 0,
      type: ApplicationCommandOptionType.Integer
    })
    questNumber: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    const world = findWizWorld(name);
    if (world === undefined)
      return void await command.reply({
        options: { ephemeral: true },
        embeds: [Embed.error("That is not a valid Wizard101 world.")]
      });

    if (questNumber > world.Quests)
      return void await command.reply({
        options: { ephemeral: true },
        embeds: [Embed.error(`That is not a valid quest number. **${world.Name}** only has **${world.Quests}** quests.`)]
      });

    const tempAttachment = createTemporaryAttachment("world_icon.png", new DataView(await fetch(world.Icon).then(res => res.arrayBuffer())));
    await command.reply({
      files: [tempAttachment.attachment],
      embeds: [
        Embed.common(`Progress through ${world.Name}`, "🌎")
          .setDescription(`You are **${Math.floor((questNumber / world.Quests) * 100 * 10) / 10}**% of the way through ${world.Name}. You have **${world.Quests - questNumber}** quests left.`)
          .setThumbnail(tempAttachment.url)
      ]
    });
  }
}