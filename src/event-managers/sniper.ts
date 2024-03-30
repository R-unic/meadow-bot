import { type ArgsOf, Discord, Guard, On } from "discordx";
import { NotBot } from "@discordx/utilities";
import type { Message } from "discord.js";

import { GuildData } from "../data.js";

@Discord()
export class Sniper {
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