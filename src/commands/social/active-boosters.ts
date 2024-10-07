import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { EmbedField, type CommandInteraction } from "discord.js";

import { LevelSystemData } from "../../data/level-system.js";
import { toRemainingTime } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class ActiveBoosters {
  @Slash({ description: "Returns your currently active boosters" })
  public async "active-boosters"(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(command.user);
    const activeBoosters = await LevelSystemData.activeBoosters.getUnexpired(member);
    const boosterTypes = new Set<string>;
    for (const booster of activeBoosters)
      boosterTypes.add(booster.type);

    const fields = Array.from(boosterTypes)
      .map<EmbedField>(boosterType => {
        const boostersOfType = activeBoosters.filter(booster => booster.type === boosterType);
        return {
          name: boosterType,
          value: boostersOfType
            .map(booster => {
              const remainingTime = Math.floor(Math.max((booster.startedAt + booster.length) - Math.floor(Date.now() / 1000), 0));
              return `- **+${booster.amount}% (${toRemainingTime(booster.length).toUpperCase()})**: ${toRemainingTime(remainingTime)} remaining`;
            })
            .join("\n"),
          inline: true
        }
      });

    const embed = Embed.common(`${member.user.globalName}'s Profile`)
      .setThumbnail(member.displayAvatarURL())
      .addFields(fields);

    if (fields.length === 0)
      embed.setDescription("No boosts are currently active.")

    await command.reply({
      embeds: [embed]
    });
  }
}