import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { configDotenv } from "dotenv";

configDotenv();
export const bot = new Client({
  silent: true,
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ]
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  console.log("Bot online!");
});

bot.on("interactionCreate", interaction => void bot.executeInteraction(interaction));

async function run(): Promise<void> {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  if (!process.env.TOKEN)
    throw Error("Could not find TOKEN in .env file");

  await bot.login(process.env.TOKEN);
}

void run();