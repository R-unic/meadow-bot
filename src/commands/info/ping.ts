import { Discord, Slash } from "discordx";
import type { CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { deleteIfPossible } from "../../utility.js";

const description = "Returns the latency between your computer and Discord's servers";

@Discord()
@Category("Info")
export class Ping {
  @Slash({ description })
  async ping(command: CommandInteraction): Promise<void> {
    if (!command.channel) return;
    const msg = await command.channel.send("Pinging...");
    const latency = msg.createdTimestamp - command.createdTimestamp;
    deleteIfPossible(msg);

    await command.reply(`Pong! Latency: ${Math.max(latency, 0)}ms`);
  }
}