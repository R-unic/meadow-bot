import { type ArgsOf, Discord, On } from "discordx";
import type { Message } from "discord.js";

import { GuildData } from "../data.js";

@Discord()
export class Sniper {
  @On()
  public messageDelete([message]: ArgsOf<"messageDelete">): void {
    GuildData.addSnipe(<Message>message, "delete");
  }

  @On()
  public messageUpdate([message]: ArgsOf<"messageUpdate">): void {
    GuildData.addSnipe(<Message>message, "edit");
  }
}