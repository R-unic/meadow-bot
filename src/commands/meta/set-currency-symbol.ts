import { Discord, Guard, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction } from "discord.js";

import { File, RequirePermissions } from "../../utility.js";
import { EconomyData } from "../../data/economy.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Meta")
@Guard(RequirePermissions(["Administrator"]))
export class SetCurrencySymbol {
  @Slash({ description: "Set the currency symbol that the bot uses." })
  public async "set-currency-symbol"(
    @SlashOption({
      description: "The symbol to use for currency",
      name: "symbol",
      required: true,
      minLength: 1,
      maxLength: 4,
      type: ApplicationCommandOptionType.String
    })
    symbol: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    File.write(EconomyData.dollarSignFilePath, symbol);
    await command.reply({
      embeds: [Embed.success(`Successfully set currency symbol to \`${symbol}\`!`)]
    });
  }
}