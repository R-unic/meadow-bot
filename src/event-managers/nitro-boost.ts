import { type ArgsOf, Discord, Guard, On } from "discordx";
import { NotBot } from "@discordx/utilities";
import { channelMention, type Snowflake } from "discord.js";

import Log from "../logger.js";
import Embed from "../embed-presets.js";

const BOOSTER_ROLE: Snowflake = "1137219435384553558";
const THANK_YOU_CHANNEL: Snowflake = "1140140495473999872"; // general

@Discord()
export class NitroBoost {
  @On()
  @Guard(NotBot)
  public async guildMemberUpdate([oldMember, member]: ArgsOf<"guildMemberUpdate">): Promise<void> {
    const rolesGained = Array.from(member.roles.valueOf().difference(oldMember.roles.valueOf()).values());
    if (oldMember.roles.valueOf().has(BOOSTER_ROLE)) return; // already had booster role
    if (!rolesGained.map(({ id }) => id).includes(BOOSTER_ROLE)) return; // did not boost
    if (!member.roles.valueOf().has(BOOSTER_ROLE)) return; // if we don't have the role at all

    const channel = await member.guild.channels.fetch(THANK_YOU_CHANNEL);
    if (!channel || !channel.isTextBased())
      return Log.error("Thank you channel provided to NitroBoost event manager is not a valid text channel.");

    await channel.send({
      embeds: [
        Embed.common("Thank you!", "💖")
          .setDescription(`Thank you for boosting the server! You now have access to ${channelMention("1137505529170759852")}, and you also have extra perms such as image embedding!`)
          .setColor("#DB46D1")
      ]
    });
  }
}