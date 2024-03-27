import type { Message } from "discord.js";

/**
 * Checks if a message is deletable, and if so deletes it after a specified amount of time (or 0 seconds).
 * @param message The message to check.
 * @param time The amount of time to wait before deleting the message, in milliseconds.
 */
export function deleteIfPossible(message: Message, time = 0): void {
  setTimeout(async () => {
    try {
      if (message === undefined || !message.deletable) return;
      await message.delete();
    } catch(e) {}
  }, time);
}