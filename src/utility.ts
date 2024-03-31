import { PermissionGuard } from "@discordx/utilities";
import type { Client } from "discordx";
import type { Message, PermissionsString } from "discord.js";

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