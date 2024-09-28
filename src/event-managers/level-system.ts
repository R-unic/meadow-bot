import { type ArgsOf, Discord, Guard, On } from "discordx";
import { NotBot } from "@discordx/utilities";
const { default: { toRoman } } = await import("roman-numerals");

import { LevelSystemData } from "../data/level-system.js";
import { deleteIfPossible } from "../utility.js";
import Embed from "../embed-presets.js";

@Discord()
export class Sniper {
  @On()
  @Guard(NotBot)
  public async messageCreate([message]: ArgsOf<"messageCreate">): Promise<void> {
    const member = message.member!;
    const leveledUp = await LevelSystemData.addXP(member);
    const prestige = await LevelSystemData.prestige.get(member);
    const level = await LevelSystemData.level.get(member);
    if (leveledUp) {
      const reply = await message.reply({
        options: {
          ephemeral: true
        },
        embeds: [
          Embed.common("You leveled up!", "🎉")
            .setDescription(`You are now level ${prestige === 0 ? "" : toRoman(prestige) + "-"}${level}.`)
        ]
      });
      deleteIfPossible(reply, 4000);
    }
  }
}