import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import type { CommandInteraction, GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { commaFormat } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Balance {
  @Slash({ description: "Returns your cash balance." })
  public async balance(command: CommandInteraction): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member!;
    const money = await EconomyData.money.get(member);

    await command.reply({
      embeds: [
        Embed.common("Balance", "💵")
          .setDescription(`You have **${EconomyData.dollarSign}${commaFormat(money)}**.`)
      ]
    });
  }
}