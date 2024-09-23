import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { Category, PermissionGuard } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction } from "discord.js";

import { GuildData } from "../../data/guild.js";
import { capitalize, RequirePermissions } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
@SlashGroup({
  name: "tags",
  description: "Commands using the tag system"
})
export class Tags {
  @Slash({ description: "Create a new tag" })
  @SlashGroup("tags")
  @Guard(RequirePermissions(["ManageGuild"]))
  public async create(
    @SlashOption({
      description: "The name of the tag. Will be used to fetch the tag",
      name: "name",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    @SlashOption({
      description: "The content of the tag, will be displayed when the tag is fetched",
      name: "content",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    content: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    await GuildData.addTag(name, content);
    await command.reply({
      embeds: [Embed.success(`Successfully created tag \`${name}\`!`)]
    });
  }

  @Slash({ description: "Delete an existing tag" })
  @SlashGroup("tags")
  @Guard(RequirePermissions(["ManageGuild"]))
  public async delete(
    @SlashOption({
      description: "The name of the tag to delete",
      name: "name",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;
    if (await GuildData.getTag(name) === undefined)
      return void await command.reply({
        embeds: [Embed.error(`No tag with the name \`${name}\` exists.`)]
      });

    await GuildData.deleteTag(name);
    await command.reply({
      embeds: [Embed.success(`Successfully deleted tag \`${name}\`!`)]
    });
  }

  @Slash({ description: "Views a tag" })
  @SlashGroup("tags")
  public async view(
    @SlashOption({
      description: "The name of the tag to view",
      name: "name",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;
    const tag = await GuildData.getTag(name);
    if (tag === undefined)
      return void await command.reply({
        embeds: [Embed.error(`No tag with the name \`${name}\` exists.`)],
        ephemeral: true
      });

    await command.reply({
      embeds: [Embed.common(capitalize(tag.name)).setDescription(tag.content)]
    });
  }

  @Slash({ description: "Lists all tag names that exist" })
  @SlashGroup("tags")
  public async list(command: CommandInteraction): Promise<void> {
    if (command.channel === null) return;

    const tags = await GuildData.getTags();
    const tagList = tags.map(({ name }) => name).join(", ");
    await command.reply({
      embeds: [
        Embed.common("All Existing Tags", "🏷️")
          .setDescription(tagList === "" ? "**No tags exist yet.**" : tagList)
      ]
    });
  }
}