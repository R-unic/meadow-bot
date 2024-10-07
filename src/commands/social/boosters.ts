import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction } from "discord.js";

import { BoosterType, LevelSystemData } from "../../data/level-system.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Boosters {
  @Slash({ description: "Returns info about all of your owned boosters" })
  public async boosters(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(command.user);
    const defaultOwnedBoosters = await LevelSystemData.getDefaultOwnedBoosters();
    const ownedBoosters = await LevelSystemData.getOwnedBoosters(member);

    await command.reply({
      embeds: [
        Embed.common(`${member.user.globalName}'s Profile`)
          .setThumbnail(member.displayAvatarURL())
          .addFields(
            {
              name: "Experience",
              value: Object.entries(defaultOwnedBoosters)
                .map<[string, number]>(([type, amount]) => [BoosterType[<BoosterType>parseInt(type)], ownedBoosters[<BoosterType>parseInt(type)] ?? amount])
                .filter(([typeName]) => typeName.startsWith("Experience"))
                .map(([typeName, amount]) => {
                  const [_, length, boostAmount] = typeName.match(/(\d+H)_(\d+)/)!;
                  return `- **+${boostAmount}% (${length})**: ${amount}`;
                })
                .join("\n"),
              inline: true,
            },
          )
      ]
    });
  }
}