import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import type { Interaction, Message } from "discord.js";
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
  ],
  simpleCommand: {
    prefix: "*",
    responses: {
      notFound: msg => <Promise<void>><unknown>msg.reply(`Command "${msg.content.slice(1)}" not found.`)
    }
  }
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  console.log("Bot online!");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", async (message: Message) => {
  await bot.executeCommand(message);
});

async function run(): Promise<void> {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  if (!process.env.TOKEN)
    throw Error("Could not find TOKEN in .env file");

  await bot.login(process.env.TOKEN);
}

void run();