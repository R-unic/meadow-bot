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
      .setDescription(message);
  }

  public static common(title: string, emoji?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title + (emoji !== undefined ? " " + emoji : ""))
      .setColor("#4479CF")
      .setTimestamp()
      .setFooter({
        text: "Developed by @_runic_",
        iconURL: "https://cdn.discordapp.com/avatars/1188234972100829274/8ed0d41a07cd34742e6b26b5cb54d52f.webp"
      });
  }
}