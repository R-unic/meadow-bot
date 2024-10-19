import { EmbedBuilder, GuildMember, type PermissionsString } from "discord.js";

import { EconomyData } from "./data/economy.js";
import { currencyFormat } from "./utility.js";

export enum EmbedColor {
  Red = "#AD4234",
  Green = "#3BCC6E",
  Blue = "#4479CF",
  Orange = "#FF5512"
}

export default class Embed {
  public static async win(message: string, member: GuildMember, amount: number): Promise<EmbedBuilder> {
    const money = await EconomyData.money.get(member);
    return this.common("You won!", "🎉")
      .setColor(EmbedColor.Green)
      .setDescription(`${message} You won ${currencyFormat(amount)}!\nYour current balance is now ${currencyFormat(money)}.`);
  }

  public static async lose(message: string, member: GuildMember, amount: number): Promise<EmbedBuilder> {
    const money = await EconomyData.money.get(member);
    return this.common("You lost!", "💔")
      .setColor(EmbedColor.Red)
      .setDescription(`${message} You lost ${currencyFormat(amount)}.\nYour current balance is now ${currencyFormat(money)}.`);
  }

  public static insufficientMoney(message: string, money: number, amount: number): EmbedBuilder {
    return this.error(`${message} You need ${currencyFormat(amount - money)} more.`);
  }

  public static success(message: string): EmbedBuilder {
    return this.common("Success", "✅")
      .setColor(EmbedColor.Green)
      .setDescription(message);
  }

  public static noPermissions(requiredPermissions: PermissionsString[]): EmbedBuilder {
    return this.error(`You do not have permissions to use this command!\n${requiredPermissions.map(perm => `\`${perm}\``).join(", ")}`);
  }

  public static error(message: string): EmbedBuilder {
    return this.common("Error", "❌")
      .setColor(EmbedColor.Red)
      .setDescription(message);
  }

  public static note(message: string): EmbedBuilder {
    return this.common("Note", "📝")
      .setDescription(message);
  }

  public static common(title?: string, emoji?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(EmbedColor.Blue)
      .setFooter({
        text: "Developed by @_runic_",
        iconURL: "https://cdn.discordapp.com/avatars/1188234972100829274/8ed0d41a07cd34742e6b26b5cb54d52f.webp"
      });

    if (title !== undefined)
      embed.setTitle(title + (emoji !== undefined ? " " + emoji : ""))

    return embed;
  }
}