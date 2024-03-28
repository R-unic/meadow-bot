import type { Message } from "discord.js";

import { Firebase } from "./firebase.js";
import type Snipe from "./structs/snipe";

export class GuildData {
  public static readonly db = new Firebase("guildData", process.env.FIREBASE_URL!);

  public static async getSnipes(guildID: string, type: "delete" | "edit"): Promise<Snipe[]> {
    return await this.db.get<Snipe[]>(`snipes/${guildID}/${type}`, [])
  }

  public static async addSnipe(message: Message, type: "delete" | "edit"): Promise<void> {
    await this.db.addToArray<Snipe>(`snipes/${message.guildId}/${type}`, {
      authorID: message.author.id,
      messageID: message.id,
      channelID: message.channelId,
      messageContent: message.content,
      timestamp: Date.now()
    });
  }
}