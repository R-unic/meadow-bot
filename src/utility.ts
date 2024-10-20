import { PermissionGuard } from "@discordx/utilities";
import type { Client } from "discordx";
import { type Message, type PermissionsString, type CommandInteraction, type EmbedBuilder, type Guild, AttachmentBuilder, bold } from "discord.js";
import { type PathLike, copyFileSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";

import { Firebase } from "./firebase.js";
import { EconomyData } from "./data/economy.js";
import Log from "./logger.js";
import Embed from "./embed-presets.js";
const { default: Worlds } = await import("./data/wiz-worlds.json", { with: { type: "json" } });

const db = new Firebase(process.env.FIREBASE_URL!);
export { db as Firebase };

export const RequirePermissions = (permissions: PermissionsString[]) => PermissionGuard(permissions, {
  ephemeral: true,
  embeds: [Embed.noPermissions(permissions)]
});

type WizWorld = (typeof Worlds)[keyof typeof Worlds];

export function findWizWorld(search: string): Maybe<WizWorld> {
  return Object.values(Worlds).find(world => world.Abbreviation === search.toLowerCase() || world.Name.toLowerCase() === search.toLowerCase())
    ?? Worlds[<keyof typeof Worlds>search.toLowerCase().replace(/ /, "")];
}

export async function getRunesMeadowGuild(client: Client): Promise<Guild> {
  return await client.guilds.fetch("1136305719226937425");
}

export async function replyWithEmbed(command: CommandInteraction, embed: EmbedBuilder): Promise<void> {
  await command.reply({ embeds: [embed] });
}

interface TemporaryAttachmentData {
  readonly attachment: AttachmentBuilder,
  readonly url: string;
}

export function createTemporaryAttachment(fileName: string, fileData: string | DataView): TemporaryAttachmentData {
  writeFileSync(fileName, fileData);
  return {
    attachment: new AttachmentBuilder(fileName),
    url: `attachment://${fileName}`
  };
}

/**
 * Checks if a message exists and is deletable, and if so deletes it after a specified amount of time (or 0 seconds).
 * @param message The message to check.
 * @param time The amount of time to wait before deleting the message, in milliseconds.
 */
export function deleteIfPossible(message?: Message, time = 0, retries = 0): void {
  setTimeout(async () => {
    try {
      if (message === undefined || !message.deletable) return;
      await message.delete();
    } catch (e) {
      if (retries > 0)
        deleteIfPossible(message, time, retries - 1);
    }
  }, time);
}

/**
 * Fetches the registered global application commands and returns an object
 * containing the command names as keys and their corresponding IDs as values.
 *
 * If there are no commands or an error occurs, an empty object is returned.
 * @param client The Discord Client instance.
 * @returns An object containing command names and their corresponding IDs.
 */
export async function getCommandIDs(client: Client): Promise<{ [name: string]: string }> {
  try {
    const commands = await client.application?.commands.fetch();
    if (!commands)
      return {};

    return Object.fromEntries(commands.map(command => [command.name, command.id]));
  } catch (error) {
    Log.error(`Issue fetching global commands: ${error}`);
    return {};
  }
}

export function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const randomIndex = random(0, i);
    [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
  }

  return shuffledArray;
}

export function commaFormat(n: number | string): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Capitalises the first letter of each word in a string.
 * @param s The string to be capitalised.
 * @returns The capitalised string.
 */
export function capitalize(s: string): string {
  return s.replace(/\S+/g, word => word.slice(0, 1).toUpperCase() + word.slice(1));
}

export function reputationPointsFormat(n: number): string {
  return bold(`${commaFormat(n)} RP`);
}

export function currencyFormat(n: number): string {
  const decimalFormatted = Number.isInteger(n) ? n.toString() : n.toFixed(2);
  return `**${EconomyData.dollarSign}${commaFormat(decimalFormatted)}**`;
}

const RNGS = new Map<number, SeededRNG>;
export function random<T extends number = number>(min: T, max: T, seed?: number): T {
  let rng: Maybe<SeededRNG>;
  if (seed !== undefined) {
    rng = RNGS.get(seed) ?? new SeededRNG(seed);
    RNGS.set(seed, rng);
  }

  const randomizer = seed === undefined ? Math : rng!;
  return <T>(Math.floor(randomizer.random() * (max - min + 1)) + min);
}

const s = 1, m = 60, h = 60 * m, d = 24 * h, w = 7 * d, mo = 30 * d;
export const time = {
  s, second: s, seconds: s,
  m, minute: m, minutes: m,
  h, hour: h, hours: h,
  d, day: d, days: d,
  w, week: w, weeks: w,
  mo, month: mo, months: mo
};

// Takes a remaining time string (e.g. 1d 5h 10s) and
// converts it to the amount of time it represents in seconds.
export function toSeconds(timeString: string): number {
  const [_, value, unit] = timeString.replace(/\s+/g, "").match(/(\d+)(\D)/) ?? [];
  const timeUnit = <keyof typeof time>unit.toLowerCase();
  return parseFloat(value) * time[timeUnit];
}

export function toRemainingTime(seconds: number): string {
  const days = Math.floor(seconds / d);
  seconds %= d;

  const hours = Math.floor(seconds / h);
  seconds %= h;

  const minutes = Math.floor(seconds / m);
  seconds %= m;

  let remainingTime = "";
  if (days > 0)
    remainingTime += days + "d ";
  if (hours > 0)
    remainingTime += hours + "h ";
  if (minutes > 0)
    remainingTime += minutes + "m ";
  if (seconds > 0)
    remainingTime += Math.floor(seconds) + "s ";

  return remainingTime.trim();
}

export class SeededRNG {
  constructor(
    private seed: number
  ) { }

  public random(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

export namespace File {
  export function remove(path: PathLike, force = false, recursive = false): void {
    if (!exists(path))
      throw new Error("Attempt to remove a non-existent file");

    rmSync(path, { force, recursive });
  }

  export function write(path: PathLike, content: string | Buffer): void {
    if (isDirectory(path))
      throw new Error("Attempt to write to a directory.");

    writeFileSync(path, content);
  }

  export function read(path: PathLike): string {
    if (!exists(path) || isDirectory(path))
      throw new Error("Attempt to read a non-existent file or a directory.");

    return readFileSync(path).toString();
  }

  export function move(from: PathLike, to: PathLike) {
    copyFileSync(from, to);
    rmSync(from);
  }

  export function exists(path: PathLike) {
    try {
      const stats = statSync(path);
      return stats.isFile();
    } catch (e) {
      return false;
    }
  }

  export function isDirectory(path: PathLike): boolean {
    try {
      const stats = statSync(path);
      return exists(path) && stats.isDirectory();
    } catch (e) {
      return false;
    }
  }
}