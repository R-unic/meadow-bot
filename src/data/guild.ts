import type { Message } from "discord.js";

import { Firebase } from "../utility.js";
import type { Tag, Snipe } from "./models/guild.js";

const MAX_SNIPES_PER_GUILD = 15; // also per category, meaning the number of delete snipes does not count towards the max amount of edit snipes

/** NOTE: This bot is only meant to be in one server at a time, and therefore data is not sorted by guild IDs.
 * If you want your bot using this source code to be in multiple servers, you need to add guild IDs in each data path.
 * For example: "guild/tags" becomes `guild/tags/${guildID}`, `guild/snipes/${type}` becomes `guild/snipes/${guildID}/${type}`, etc.
 * You can even have the guild IDs be the main key. What I mean by this is doing `guild/${guildID}/tags` instead of `guild/tags/${guildID}`, and so on for every other key.
 */
export class GuildData {
  public static async getTag(name: string): Promise<Maybe<Tag>> {
    return (await this.getTags()).find(tag => tag.name === name);
  }

  public static async getTags(): Promise<Tag[]> {
    return await Firebase.get<Tag[]>("guild/tags", []);
  }

  public static async addTag(name: string, content: string): Promise<void> {
    await Firebase.addToArray<Tag>("guild/tags", { name, content });
  }

  public static async deleteTag(name: string): Promise<void> {
    const index = (await this.getTags()).map(({ name }) => name).indexOf(name);
    await Firebase.delete(`tags/${index}`);
  }

  public static async getSnipes(type: "delete" | "edit"): Promise<Snipe[]> {
    return await Firebase.get<Snipe[]>(`guild/snipes/${type}`, []);
  }

  public static async addSnipe(message: Message, type: "delete" | "edit"): Promise<void> {
    await Firebase.addToArray<Snipe>(`guild/snipes/${type}`, {
      authorID: message.author.id,
      messageID: message.id,
      channelID: message.channelId,
      messageContent: message.content,
      attachments: Array.from(message.attachments.values()),
      timestamp: Date.now()
    }, MAX_SNIPES_PER_GUILD);
  }
}