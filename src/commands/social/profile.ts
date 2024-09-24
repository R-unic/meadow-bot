import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, type GuildMember, TimestampStyles, time } from "discord.js";
const { default: { toRoman } } = await import("roman-numerals");

import { LevelSystemData, getXpToLevelUp } from "../../data/level-system.js";
import { commaFormat } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Profile {
  @Slash({ description: "Returns your profile embed including prestige, level, XP, etc." })
  public async profile(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member!;
    const prestige = await LevelSystemData.prestige.get(member);
    const level = await LevelSystemData.level.get(member);
    const xp = await LevelSystemData.xp.get(member);
    const xpToLevelUp = getXpToLevelUp(prestige, level);

    await command.reply({
      embeds: [
        Embed.common(`${member.user.globalName}'s Profile`)
          .setThumbnail(member.displayAvatarURL())
          .addFields(
            {
              name: "Prestige",
              value: prestige === 0 ? "0" : toRoman(prestige),
              inline: true,
            },
            {
              name: "Level",
              value: level.toString(),
              inline: true,
            },
            {
              name: "XP",
              value: commaFormat(xp),
              inline: true,
            },
            {
              name: "XP to level up",
              value: commaFormat(xpToLevelUp),
              inline: true,
            },
            {
              name: "Joined",
              value: time(member.joinedAt!, TimestampStyles.RelativeTime),
              inline: true,
            }
          )
      ]
    });
  }
}