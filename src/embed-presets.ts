import { EmbedBuilder } from "discord.js";

export default class Embed {
  public static success(message: string): EmbedBuilder {
    return this.common("Success", "✅")
      .setColor("#3BCC6E")
      .setDescription(message);
  }

  public static error(message: string): EmbedBuilder {
    return this.common("Error", "❌")
      .setColor("#AD4234")
      .setDescription(message);
  }

  public static note(message: string): EmbedBuilder {
    return this.common("Note", "📝")
      .setColor("#4479CF")
      .setDescription(message);
  }

  public static common(title: string, emoji?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title + (emoji !== undefined ? " " + emoji : ""))
      .setTimestamp();
  }
}