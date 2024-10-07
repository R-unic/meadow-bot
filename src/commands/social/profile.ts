import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { type CommandInteraction, type GuildMember, type User, ApplicationCommandOptionType, TimestampStyles, time } from "discord.js";
const { default: { toRoman } } = await import("roman-numerals");

import { LevelSystemData, MAX_LEVEL, MAX_PRESTIGE, getXpPerMessage, getXpToLevelUp } from "../../data/level-system.js";
import { commaFormat } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Profile {
  @Slash({ description: "Returns your profile embed including prestige, level, XP, etc." })
  public async profile(
    @SlashOption({
      description: "The user to view the profile of (omit for self)",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: Maybe<User>,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(user ?? command.user);
    const prestige = await LevelSystemData.prestige.get(member);
    const level = await LevelSystemData.level.get(member);
    const xp = await LevelSystemData.xp.get(member);
    const activeBoosters = await LevelSystemData.activeBoosters.get(member);
    const xpToLevelUp = getXpToLevelUp(prestige, level);
    const minXpPerMessage = getXpPerMessage(prestige, level, "min");
    const maxXpPerMessage = getXpPerMessage(prestige, level, "max");

    await command.reply({
      embeds: [
        Embed.common(`${member.user.globalName}'s Profile`)
          .setThumbnail(member.displayAvatarURL())
          .addFields(
            {
              name: "Prestige",
              value: prestige === 0 ? "0" : toRoman(prestige) + (prestige === MAX_PRESTIGE ? " (max)" : ""),
              inline: true,
            },
            {
              name: "Level",
              value: level.toString() + (level === MAX_LEVEL ? " (max)" : ""),
              inline: true,
            },
            {
              name: "XP",
              value: commaFormat(xp),
              inline: true,
            },
            {
              name: "XP to level up",
              value: level === MAX_LEVEL ? "n/a" : commaFormat(xpToLevelUp),
              inline: true,
            },
            {
              name: "XP per message",
              value: level === MAX_LEVEL ? "n/a" : (commaFormat(minXpPerMessage) + " - " + commaFormat(maxXpPerMessage)),
              inline: true,
            },
            {
              name: "Active XP boosters",
              value: activeBoosters.filter(booster => booster.type === "Experience").length.toString(),
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