import { dirname, importx } from "@discordx/importer";
import { Client } from "discordx";
import { ActivityType, IntentsBitField } from "discord.js";
import { configDotenv } from "dotenv";

import { File } from "./utility.js";
import Log from "./logger.js";

const ROOT = dirname(import.meta.url);
const LOGS = ["out", "error"];
configDotenv();

// delete old logs
// for (const name of LOGS)
//   File.remove(`${ROOT}/../${name}.log`);

const client = new Client({
  silent: true,
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ]
});

client.on("error", e => Log.error(e.message));
client.once("ready", async () => {
  await client.initApplicationCommands();
  client.user?.setPresence({
    status: "online",
    activities: [{
      name: "/help",
      type: ActivityType.Listening
    }]
  });
  Log.info("Bot online!");
});

client.on("interactionCreate", interaction => void client.executeInteraction(interaction));

async function run(): Promise<void> {
  await importx(`${ROOT}/{event-managers,commands}/**/*.{ts,js}`);
  if (!process.env.TOKEN)
    return Log.error("Could not find TOKEN in .env file");

  await client.login(process.env.TOKEN);
}

run();