import { NotBot } from "@discordx/utilities";
import { type ArgsOf, Discord, Guard, On } from "discordx";
import type { Message } from "discord.js";

import { GuildData } from "../data/guild.js";

@Discord()
export class SniperEventManager {
  @On()
  @Guard(NotBot)
  public messageDelete([message]: ArgsOf<"messageDelete">): void {
    GuildData.addSnipe(<Message>message, "delete");
  }

  @On()
  @Guard(NotBot)
  public messageUpdate([message]: ArgsOf<"messageUpdate">): void {
    GuildData.addSnipe(<Message>message, "edit");
  }
}