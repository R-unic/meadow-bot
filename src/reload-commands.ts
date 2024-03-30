import { REST, Routes } from "discord.js";
import { configDotenv } from "dotenv";
import { client } from "./main.js";

configDotenv();
const rest = (new REST).setToken(process.env.TOKEN!);
rest.put(
  Routes.applicationCommands("1188234972100829274"),
  { body: client.applicationCommands }
);