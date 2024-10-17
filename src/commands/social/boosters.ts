import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { EmbedField, type CommandInteraction } from "discord.js";

import { BoostersData, BoosterType } from "../../data/boosters.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Boosters {
  @Slash({ description: "Returns info about all of your owned boosters" })
  public async boosters(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(command.user);
    const boosterTypes = new Set<string>;
    for (const type of Object.values(BoosterType).filter(type => typeof type === "number")) {
      const [_, name] = BoosterType[type].match(/([A-Za-z]+)(\d+[A-Z])_(\d+)/)!
      boosterTypes.add(name);
    }

    const fields = await Promise.all(
      Array.from(boosterTypes)
        .map<Promise<EmbedField>>(async name => {
          return {
            name,
            value: (await Promise.all(Object.entries(BoostersData.ownedBoosters)
              .map(async ([type, field]) => {
                const typeName = BoosterType[<BoosterType>parseInt(type)]
                const [_, length, boostAmount] = typeName.match(/(\d+H)_(\d+)/)!;
                return `- **+${boostAmount}% (${length})**: ${await field.get(member)}`;
              })))
              .join("\n"),
            inline: true
          }
        })
    );

    await command.reply({
      embeds: [
        Embed.common()
          .setAuthor({
            name: `${member.user.globalName}'s Boosters`,
            iconURL: member.displayAvatarURL()
          })
          .addFields(fields)
      ]
    });
  }
}