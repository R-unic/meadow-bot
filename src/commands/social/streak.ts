import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { GuildMember, bold, type CommandInteraction } from "discord.js";

import { BoostersData } from "../../data/boosters.js";
import { replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Social")
export class Streak {
  @Slash({ description: "Returns your daily streak." })
  public async streak(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const streak = await BoostersData.dailyStreak.get(member);

    await replyWithEmbed(command,
      Embed.common()
        .setAuthor({
          name: "Your Streak 🔥",
          iconURL: member.displayAvatarURL()
        })
        .setDescription(`You have an activity streak of ${bold(streak === 30 ? "30+" : streak.toString())} day${streak > 0 && streak < 2 ? "" : "s"}.`)
    );
  }
}