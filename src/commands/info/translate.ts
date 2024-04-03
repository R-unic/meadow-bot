import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType } from "discord.js";
import type { TextBasedChannel, CommandInteraction, Snowflake, GuildBasedChannel, PrivateThreadChannel, DMChannel, PartialDMChannel, AnyThreadChannel, NonThreadGuildBasedChannel } from "discord.js";
import { type TargetLanguageCode, Translator } from "deepl-node";

import Embed from "../../embed-presets.js";

if (!process.env.DEEPL_API)
  throw new Error("No value for DEEPL_API in .env file")

const translator = new Translator(process.env.DEEPL_API!);
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
      minLength: 8
    })
    messageID: Snowflake,
    @SlashOption({
      description: "The language to translate to",
      name: "language",
      required: true,
      type: ApplicationCommandOptionType.String,
      minLength: 2,
      maxLength: 5
    })
    targetLanguage: TargetLanguageCode,
    command: CommandInteraction
  ): Promise<void> {
    if (!command.channel) return;

    const guild = await command.guild?.fetch()!;
    const channels = await guild.channels.fetch();
    const [messagePromise] = Array.from(channels
      .filter((channel): channel is NonThreadGuildBasedChannel => channel !== null)
      .filter((channel): channel is Exclude<TextBasedChannel, AnyThreadChannel | DMChannel | PartialDMChannel> => !channel.isThread() && channel.isTextBased())
      .mapValues(async channel => await channel.messages.fetch(messageID))
      .values());

    const message = await messagePromise;
    if (!message)
      return void await command.reply({
        embeds: [Embed.error(`Could not find message with ID \`${messageID}\``)],
        ephemeral: true
      });

    const validTargetLanguageCodes = (await translator.getTargetLanguages()).map(({ code }) => code);
    if (!validTargetLanguageCodes.includes(targetLanguage))
      return void await command.reply({
        embeds: [Embed.error(`\`${targetLanguage}\` is not a valid language to translate to.\nValid languages: ${validTargetLanguageCodes.map(lang => `\`${lang}\``).join(", ")}`)],
        ephemeral: true
      });

    const result = await translator.translateText(message.content,  null, targetLanguage);
    await command.reply({
      embeds: [
        Embed.common(`\`${result.detectedSourceLang}\` -> \`${targetLanguage}\``)
          .setDescription(result.text)
      ]
    });
  }
}