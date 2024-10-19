import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction } from "discord.js";

import { BoostersData } from "../../data/boosters.js";
import { BoosterType } from "../../data/models/boosters.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class UseBooster {
  @Slash({ description: "Returns info about all of your owned boosters" })
  public async "use-booster"(
    @SlashOption({
      description: "The type of booster to use",
      name: "type",
      required: true,
      type: ApplicationCommandOptionType.Integer,
      autocomplete(interaction) {
        return interaction.respond(
          Object.entries(BoosterType)
            .filter(([_, value]) => typeof value === "number")
            .map(([name, value]) => {
              const [_, fullName, length, amount] = name.match(/([A-Za-z]+)(\d+[A-Z])_(\d+)/)!;
              return { name: `+${amount}% ${fullName} (${length})`, value };
            })
        );
      }
    })
    type: BoosterType,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(command.user);
    if (await BoostersData.ownedBoosters[type].get(member) <= 0)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("Cannot activate booster: You do not own a booster of this type!")]
      });

    await BoostersData.activeBoosters.add(member, type);
    await command.reply({
      embeds: [Embed.success(`Successfully activated booster!`)]
    });
  }
}