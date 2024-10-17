import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, type GuildMember, italic } from "discord.js";
const { default: { toRoman } } = await import("roman-numerals");

import { BoostersData, BoosterType } from "../../data/boosters.js";
import { LevelSystemData, MAX_LEVEL, MAX_PRESTIGE } from "../../data/level-system.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Prestige {
  @Slash({ description: "Increases your prestige and resets your level if you are max level." })
  public async prestige(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const prestige = await LevelSystemData.prestige.get(member);
    const level = await LevelSystemData.level.get(member);
    const isMaxLevel = level === MAX_LEVEL;
    const isMaxPrestige = prestige === MAX_PRESTIGE;

    if (!isMaxLevel)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("Cannot prestige: You are not max level.")]
      });
    if (isMaxPrestige)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("Cannot prestige: You are max prestige.")]
      });

    await LevelSystemData.prestige.increment(member);
    await LevelSystemData.level.set(member, 1);
    await LevelSystemData.xp.set(member, 0);
    await BoostersData.ownedBoosters[BoosterType.Experience3H_10].increment(member);
    await command.reply({
      embeds: [Embed.success(`You have successfully prestiged! You are now prestige ${toRoman(prestige + 1)}${prestige === MAX_LEVEL ? " (max)" : ""}.\n\n${italic("You have earned a 3-hour XP booster. View your boosters using </boosters:1292921134609862766>.")}`)]
    });
  }
}