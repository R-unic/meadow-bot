import { Discord, Guard, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { dirname } from "@discordx/importer";
import { ApplicationCommandOptionType, type CommandInteraction } from "discord.js";

import { File, RequirePermissions } from "../../utility.js";
import Embed from "../../embed-presets.js";

const VALID_LOG_TYPES = ["out", "error"];
const VALID_TYPES_LIST = VALID_LOG_TYPES.map(t => `\`${t}\``).join(", ");

@Discord()
@Category("Meta")
@Guard(RequirePermissions(["Administrator"]))
export class ViewLog {
  @Slash({ description: "View the logs for the given log type" })
  public async "view-log"(
    @SlashOption({
      description: `The type of logs to view (${VALID_TYPES_LIST})`,
      name: "type",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete(interaction) {
        return interaction.respond([
          {
            name: "out",
            value: "out"
          }, {
            name: "error",
            value: "error"
          }
        ]);
      }
    })
    type: string,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    type = type.toLowerCase();
    if (!VALID_LOG_TYPES.includes(type))
      return void await command.reply({
        embeds: [Embed.error(`\`${type}\` is not a valid log type.\nValid log types: ${VALID_TYPES_LIST}`)],
        ephemeral: true
      });

    const logFilePath = `${dirname(import.meta.url)}/../../../${type}.log`;
    const logContents = File.exists(logFilePath) ? File.read(logFilePath) : "";
    await command.reply({
      embeds: [
        Embed.common(`Contents of \`${type}.log\``)
          .setDescription(`\`\`\`ansi\n${(logContents === "" ? "(File empty)" : logContents).slice(0, 4084)}\`\`\``)
      ]
    });
  }
}