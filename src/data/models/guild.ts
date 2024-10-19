import type { Attachment, Snowflake } from "discord.js";

export interface Snipe {
  readonly authorID: Snowflake;
  readonly messageID: Snowflake;
  readonly channelID: Snowflake;
  readonly messageContent: string;
  readonly attachments: Attachment[]
  readonly timestamp: number;
}

export interface Tag {
  readonly name: string;
  readonly content: string;
}