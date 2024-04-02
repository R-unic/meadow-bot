import { PermissionGuard } from "@discordx/utilities";
import type { Client } from "discordx";
import type { Message, PermissionsString } from "discord.js";
import { type PathLike, copyFileSync, readFileSync, rmSync, statSync } from "fs";

import Log from "./logger.js";
import Embed from "./embed-presets.js";

export const RequirePermissions = (permissions: PermissionsString[]) => PermissionGuard(permissions, {
  ephemeral: true,
  embeds: [Embed.noPermissions(permissions)]
});

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
    } catch(e) {}
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

/**
 * Capitalises the first letter of each word in a string.
 * @param s The string to be capitalised.
 * @returns The capitalised string.
 */
export function capitalize(s: string): string {
  return s.replace(/\S+/g, word => word.slice(0, 1).toUpperCase() + word.slice(1));
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
    } catch(e) {
      return false;
    }
  }

  export function isDirectory(path: PathLike): boolean {
    try {
      const stats = statSync(path);
      return exists(path) && stats.isDirectory();
    } catch(e) {
      return false;
    }
  }
}