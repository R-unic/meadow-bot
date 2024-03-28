import { dirname, importx } from "@discordx/importer";
import { Client } from "discordx";
import { IntentsBitField } from "discord.js";
import { configDotenv } from "dotenv";

import Log from "./logger.js";

configDotenv();
export const client = new Client({
  silent: true,
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ]
});

client.once("ready", async () => {
  await client.initApplicationCommands();
  Log.info("Bot online!")
});

client.on("interactionCreate", interaction => void client.executeInteraction(interaction));

async function run(): Promise<void> {
  await importx(`${dirname(import.meta.url)}/{event-managers,commands}/**/*.{ts,js}`);
  if (!process.env.TOKEN)
    return Log.error("Could not find TOKEN in .env file");

  await client.login(process.env.TOKEN);
}

run();