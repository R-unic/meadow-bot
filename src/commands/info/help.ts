import { type Client, DApplicationCommand, Discord, MetadataStorage, SelectMenuComponent, Slash } from "discordx";
import { Category, type ICategory } from "@discordx/utilities";
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, type CommandInteraction, type SelectMenuComponentOptionData } from "discord.js";

import { getCommandIDs, capitalize, deleteIfPossible } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Info")
export class Help {
  @Slash({ description: "Returns all of the commands the bot has" })
  async help(command: CommandInteraction, client: Client): Promise<void> {
    if (!command.channel) return;

    const embed = this.baseEmbed(client);
    const categories = Array.from(new Set(
      MetadataStorage.instance.applicationCommands
        .filter((cmd: DApplicationCommand & ICategory) => cmd.category)
        .map((cmd: DApplicationCommand & ICategory) => cmd.category as string)
    )).map<SelectMenuComponentOptionData>(category => ({
      label: category,
      value: `help-${category.toLowerCase()}`
    }));

    if (categories.length <= 1) {
      // If there"s only one category, fetch and display commands from that category
      const selectedCategory = categories[0].value.replace(/^help-/, "").toLowerCase();
      const commandsInCategory = MetadataStorage.instance.applicationCommands
        .filter((cmd: DApplicationCommand & ICategory) => cmd.category?.toLowerCase() === selectedCategory && cmd.name?.toLowerCase() !== "help");

      const commandIDs = await getCommandIDs(client);
      for (const command of commandsInCategory) {
        const commandID = commandIDs[command.name];
        const commandMention = commandID ? `</${command.name}:${commandID}>` : capitalize(command.name);
        embed.addFields({
          name: `● ${commandMention}`,
          value: `\u200b \u200b \u200b ○ ${command.description}`,
        });
      }

      // Send the initial message without the select menu
      await command.user.send({ embeds: [embed] });
    } else {
      // Create the select menu and send the initial message with it
      await command.user.send({
        embeds: [embed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("helpSelect")
                .setPlaceholder("Select category")
                .addOptions(...categories),
            )
        ]
      });
    }

    await command.reply({ embeds: [Embed.success("Sent a help menu to your DMs!")] })
  }

  /**
   * Select menu component handler to display commands of a specific category.
   */
  @SelectMenuComponent({ id: "helpSelect" })
  async handleMenu(interaction: StringSelectMenuInteraction, client: Client): Promise<void> {
    const [selectedValue] = interaction.values;
    if (!selectedValue)
      return deleteIfPossible(interaction.message);

    const selectedCategory = selectedValue.replace(/^help-/, "").toLowerCase();
    const commandsInCategory = MetadataStorage.instance.applicationCommands
      .filter((cmd: DApplicationCommand & ICategory) => cmd.category?.toLowerCase() === selectedCategory && cmd.name?.toLowerCase() !== "help");

    const commandIDs = await getCommandIDs(client);
    const embed = this.baseEmbed(client);
    for (const command of commandsInCategory) {
      const commandID = commandIDs[command.name];
      const commandMention = commandID ? `</${command.name}:${commandID}>` : capitalize(command.name);
      embed.addFields({
        name: `● ${commandMention}`,
        value: `\u200b \u200b \u200b ○ ${command.description}`,
      });
    }

    await interaction.update({ embeds: [embed] });
  }

  private baseEmbed(client: Client) {
    return Embed.common("Help Menu")
      .setDescription("These are all of my commands!")
      .setColor("#4479CF")
      .setThumbnail(`${client.user?.displayAvatarURL()}`);
  }
}