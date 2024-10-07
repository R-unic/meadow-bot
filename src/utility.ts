import { PermissionGuard } from "@discordx/utilities";
import type { Client } from "discordx";
import { type Message, type PermissionsString, AttachmentBuilder } from "discord.js";
import { type PathLike, copyFileSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";

import Log from "./logger.js";
import Embed from "./embed-presets.js";
const { default: Worlds } = await import('./data/wiz-worlds.json', { with: { type: "json" } });

export const RequirePermissions = (permissions: PermissionsString[]) => PermissionGuard(permissions, {
  ephemeral: true,
  embeds: [Embed.noPermissions(permissions)]
});

type WizWorld = (typeof Worlds)[keyof typeof Worlds];

export function findWorld(search: string): Maybe<WizWorld> {
  return Object.values(Worlds).find(world => world.Abbreviation === search.toLowerCase() || world.Name.toLowerCase() === search.toLowerCase())
    ?? Worlds[<keyof typeof Worlds>search.toLowerCase().replace(/ /, "")];
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
export function deleteIfPossible(message?: Message, time = 0): void {
  setTimeout(async () => {
    try {
      if (message === undefined || !message.deletable) return;
      await message.delete();
    } catch (e) { }
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

export function commaFormat(n: number): string {
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

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const s = 1, m = 60, h = 3600, d = 86400, w = 604800;
const timePatterns = {
  s, second: s, seconds: s,
  m, minute: m, minutes: m,
  h, hour: h, hours: h,
  d, day: d, days: d,
  w, week: w, weeks: w
};

// Takes a remaining time string (e.g. 1d 5h 10s) and
// converts it to the amount of time it represents in seconds.
export function toSeconds(time: string): number {
  const matches = time.replace(/\s+/g, "")[0].match(/(\d+)(\D)/) ?? [];
  return matches.reduce((sum, [value, unit]) => {
    const timeUnit = <keyof typeof timePatterns>unit;
    const figure = parseFloat(value);
    return sum + figure * timePatterns[timeUnit];
  }, 0);
}

export namespace File {
  export function remove(path: PathLike, force = false, recursive = false): void {
    if (!exists(path))
      throw new Error("Attempt to remove a non-existent file");

    rmSync(path, { force, recursive });
  }

  export function read(path: PathLike): string {
    if (!exists(path) && isDirectory(path))
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