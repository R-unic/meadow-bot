import type { Message } from "discord.js";

import type Snipe from "./structs/snipe";

class Firebase {
  private readonly auth = `.json?auth=${process.env.FIREBASE_AUTH}`;

  public constructor(
    private readonly name: string,
    private readonly baseURL: string
  ) {
    this.baseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/"
  }

  public async set<T>(path?: string, value?: T, headers?: Record<string, string>): Promise<void> {
    if ((value instanceof Array && value.length === 0) || (value instanceof Object && Object.entries(value).length === 0))
      return this.delete(path);

    await fetch(this.getEndpoint(path), {
      method: "PUT",
      body: JSON.stringify(value),
      headers
    }).catch(err => console.warn(`[Firebase] Error: ${err}`));
  }

  public async get<T>(path?: string, defaultValue?: T): Promise<T> {
    return <T>await fetch(this.getEndpoint(path), { method: "GET" })
      .then(res => res.json()) ?? defaultValue!;
  }

  public async delete(path?: string): Promise<void> {
    await this.set(path, undefined, {"X-HTTP-Method-Override": "DELETE"});
  }

  public async increment(path?: string, delta = 1): Promise<void> {
    await this.set(path, await this.get<number>(path) + delta);
  }

  public async addToArray<T>(path: string, value: T): Promise<void> {
    const data = await this.get<T[]>(path, []);
    this.set(`${path}/${data.length}`, value);
  }

  private getEndpoint(path?: string): string {
    return this.baseURL + this.name + encodeURIComponent(path === undefined ? "" : `/${path}`) + this.auth;
  }
}

export class GuildData {
  private static readonly db = new Firebase("guildData", process.env.FIREBASE_URL!);

  public static async addSnipe(message: Message, type: "delete" | "edit"): Promise<void> {
    await this.db.addToArray<Snipe>(`snipes/${message.guildId}/${type}`, {
      authorID: message.author.id,
      messageContent: message.content,
      timestamp: Date.now()
    });
  }
}