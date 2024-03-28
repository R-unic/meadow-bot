import type { Message } from "discord.js";

import { Firebase } from "./firebase.js";
import type Snipe from "./structs/snipe";

const MAX_SNIPES_PER_GUILD = 15; // also per category, meaning the number of delete snipes does not count towards the max amount of edit snipes

export class GuildData {
  public static readonly db = new Firebase("guildData", process.env.FIREBASE_URL!);

  public static async getSnipes(guildID: string, type: "delete" | "edit"): Promise<Snipe[]> {
    return await this.db.get<Snipe[]>(`snipes/${guildID}/${type}`, []);
  }

  public static async addSnipe(message: Message, type: "delete" | "edit"): Promise<void> {
    await this.db.addToArray<Snipe>(`snipes/${message.guildId}/${type}`, {
      authorID: message.author.id,
      messageID: message.id,
      channelID: message.channelId,
      messageContent: message.content,
      timestamp: Date.now()
    }, MAX_SNIPES_PER_GUILD);
  }
}