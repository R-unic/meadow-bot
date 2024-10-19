import { type ArgsOf, Discord, Guard, On } from "discordx";
import { NotBot } from "@discordx/utilities";
const { default: { toRoman } } = await import("roman-numerals");

import { deleteIfPossible } from "../utility.js";
import { LevelSystemData, MAX_LEVEL } from "../data/level-system.js";
import Embed from "../embed-presets.js";

@Discord()
export class LevelSystemEventManager {
  @On()
  @Guard(NotBot)
  public async messageCreate([message]: ArgsOf<"messageCreate">): Promise<void> {
    const member = message.member!;
    if (await LevelSystemData.level.get(member) >= MAX_LEVEL) return;

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
      deleteIfPossible(reply, 4000, 3);
    }
  }
}