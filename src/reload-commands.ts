import { REST, Routes } from "discord.js";
import { configDotenv } from "dotenv";
import { client } from "./main";

configDotenv();
const rest = (new REST).setToken(process.env.TOKEN!);
rest.put(
  Routes.applicationCommands(client.user?.id!),
  { body: client.applicationCommands },
);