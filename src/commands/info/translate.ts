import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, messageLink } from "discord.js";
import type { CommandInteraction, Snowflake } from "discord.js";
import { LanguageCode, SourceLanguageCode, type TargetLanguageCode, Translator } from "deepl-node";

import Embed from "../../embed-presets.js";

if (!process.env.DEEPL_API)
  throw new Error("No value for DEEPL_API in .env file")

const translator = new Translator(process.env.DEEPL_API!);
const NOTE = "NOTE: You need to use this command in the same channel as the message you're trying to translate";

function getLanguageMap(target = false): { name: string; value: string; }[] {
  const map = [
    { name: "English", value: target ? "en-US" : "en" },
    { name: "Spanish", value: "es" },
    { name: "French", value: "fr" },
    { name: "German", value: "de" },
    { name: "Italian", value: "it" },
    { name: "Chinese (Mandarin)", value: "zh" },
    { name: "Japanese", value: "ja" },
    { name: "Korean", value: "ko" },
    { name: "Russian", value: "ru" },
    { name: "Dutch", value: "nl" },
    { name: "Bulgarian", value: "bg" },
    { name: "Danish", value: "da" },
    { name: "Greek", value: "el" },
    { name: "Czech", value: "cs" },
    { name: "Estonian", value: "et" },
    { name: "Finnish", value: "fi" },
    { name: "Hungarian", value: "hu" },
    { name: "Indonesian", value: "id" },
    { name: "Polish", value: "pl" },
    { name: "Romanian", value: "ro" },
    { name: "Swedish", value: "sv" },
    { name: "Turkish", value: "tr" },
    { name: "Ukrainian", value: "uk" }
  ];

  if (target)
    map.push({ name: "Portuguese (Brazil)", value: "pt-BR" }, { name: "Portuguese (Portugal)", value: "pt-PT" });
  else
    map.push({ name: "Portuguese", value: "pt" });

  return map;
}

@Discord()
@Category("Info")
export class Translate {
  @Slash({ description: "Translates the message corresponding to `message-id` to `language`" })
  public async translate(
    @SlashOption({
      description: "The ID of the message to translate",
      name: "message-id",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: interaction => interaction.respond([
        {
          name: "Last message",
          value: interaction.channel!.lastMessageId!.toString()
        }
      ]),
      minLength: 8
    })
    messageID: Snowflake,
    @SlashOption({
      description: "The language to translate to",
      name: "language",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: interaction => interaction.respond(getLanguageMap(true)),
      minLength: 2,
      maxLength: 5
    })
    targetLanguage: TargetLanguageCode,
    @SlashOption({
      description: "The language to translate from",
      name: "input-language",
      required: false,
      type: ApplicationCommandOptionType.String,
      autocomplete: interaction => interaction.respond(getLanguageMap()),
      minLength: 2,
      maxLength: 5
    })
    inputLanguage: SourceLanguageCode | undefined,
    command: CommandInteraction
  ): Promise<void> {
    if (!command.channel) return;

    const message = await command.channel.messages.fetch(messageID);
    if (!message)
      return void await command.reply({
        embeds: [Embed.error(`Could not find message with ID \`${messageID}\`\n${NOTE}`)],
        ephemeral: true
      });

    const validTargetLanguageCodes = (await translator.getTargetLanguages()).map(({ code }) => code);
    if (!validTargetLanguageCodes.includes(targetLanguage))
      return void await command.reply({
        embeds: [Embed.error(`\`${targetLanguage}\` is not a valid language to translate to.\nValid languages: ${validTargetLanguageCodes.map(lang => `\`${lang}\``).join(", ")}`)],
        ephemeral: true
      });

    const result = await translator.translateText(message.content, inputLanguage === undefined ? null : inputLanguage, targetLanguage);
    await command.reply({
      embeds: [
        Embed.common(`\`${result.detectedSourceLang}\` -> \`${targetLanguage}\``)
          .setURL(messageLink(command.channel.id, message.id))
          .setDescription(result.text)
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL()
          })
      ]
    });
  }
}