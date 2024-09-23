import { type ArgsOf, Discord, Guard, On } from "discordx";
import { NotBot } from "@discordx/utilities";
import { toRoman } from "roman-numerals";

import { LevelSystemData } from "src/data/level-system.js";
import Embed from "src/embed-presets";

@Discord()
export class Sniper {
  @On()
  @Guard(NotBot)
  public async messageCreate([message]: ArgsOf<"messageCreate">): Promise<void> {
    const member = message.member!;
    const leveledUp = await LevelSystemData.addXP(member);
    if (leveledUp)
      message.reply({
        embeds: [
          Embed.common("You leveled up!", "🎉")
            .setDescription(`You are now level ${toRoman(await LevelSystemData.prestige.get(member))}-${await LevelSystemData.level.get(member)}.`)
        ]
      });
  }
}