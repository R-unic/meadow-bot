import type { Snowflake } from "discord.js";

interface Snipe {
  readonly authorID: Snowflake;
  readonly messageID: Snowflake;
  readonly channelID: Snowflake;
  readonly messageContent: string;
  readonly timestamp: number;
}

export default Snipe;