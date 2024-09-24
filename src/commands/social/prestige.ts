import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, type GuildMember, TimestampStyles, time } from "discord.js";
const { default: { toRoman } } = await import("roman-numerals");

import { LevelSystemData, MAX_LEVEL, MAX_PRESTIGE, getXpToLevelUp } from "../../data/level-system.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Prestige {
  @Slash({ description: "Increases your prestige and resets your level if you are max level." })
  public async prestige(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member!;
    const prestige = await LevelSystemData.prestige.get(member);
    const level = await LevelSystemData.level.get(member);
    const isMaxLevel = level === MAX_LEVEL;
    const isMaxPrestige = prestige === MAX_PRESTIGE;

    if (!isMaxLevel)
      return void await command.reply({
        embeds: [Embed.error("Cannot prestige: You are not max level.")]
      });
    if (isMaxPrestige)
      return void await command.reply({
        embeds: [Embed.error("Cannot prestige: You are max prestige.")]
      });

    await LevelSystemData.prestige.increment(member);
    await LevelSystemData.level.set(member, 1);
    await command.reply({
      embeds: [Embed.success(`You have successfully prestiged! You are now prestige ${toRoman(prestige + 1)}.`)]
    });
  }
}